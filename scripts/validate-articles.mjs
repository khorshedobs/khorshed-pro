#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { isPublicArticleData, parseFrontmatter } from './lib/frontmatter.mjs';

const VALID_STATUSES = new Set([
  'idea',
  'researching',
  'drafting',
  'draft',
  'technical-review',
  'editorial-review',
  'ready',
  'published',
]);

const VALID_SECTION_CATEGORIES = new Set([
  'Language Features',
  'Object-Oriented Design',
  'Type System',
  'Concurrency & Runtime',
  'Functional Programming',
  'Performance & Internals',
  'Architecture & Security',
]);

const VALID_ROADMAP_CATEGORIES = new Set([
  ...VALID_SECTION_CATEGORIES,
  'Architecture',
  'Performance',
  'Compatibility',
  'Security',
]);

const VALID_VERIFICATION_STATUSES = new Set([
  'unverified',
  'syntax-checked',
  'runtime-tested',
  'awaiting-php-release',
]);

const EXPECTED_ROADMAP_ALLOCATIONS = {
  '8.0': 5,
  '8.1': 4,
  '8.2': 4,
  '8.3': 4,
  '8.4': 4,
  '8.5': 4,
  '8.6': 5,
};

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'src/content/articles');
const seriesDir = path.join(rootDir, 'src/content/series');
const roadmapPath = path.join(rootDir, 'src/data/editorial-roadmap.json');
const ogDir = path.join(rootDir, 'public/og');
const socialDir = path.join(rootDir, 'content/social');

const errors = [];
const warnings = [];
const manualReviewItems = [];

function stripFencedCodeAndImports(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<CodeComparison[\s\S]*?\/>/g, '')
    .replace(/`[^`]+`/g, '');
}

function validateEditorialRoadmap(validSeriesIds) {
  if (!fs.existsSync(roadmapPath)) {
    errors.push('src/data/editorial-roadmap.json is missing');
    return;
  }

  let roadmap;
  try {
    roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
  } catch (err) {
    errors.push(`src/data/editorial-roadmap.json invalid JSON: ${err.message}`);
    return;
  }

  if (roadmap.seriesId && !validSeriesIds.has(String(roadmap.seriesId))) {
    errors.push(`editorial-roadmap.json references unknown seriesId "${roadmap.seriesId}"`);
  }

  if (roadmap.targetTotal !== 30) {
    errors.push(`editorial-roadmap.json targetTotal must be 30 (found ${roadmap.targetTotal})`);
  }

  if (!Array.isArray(roadmap.articles) || roadmap.articles.length !== 30) {
    errors.push(
      `editorial-roadmap.json must contain exactly 30 planned articles (found ${
        Array.isArray(roadmap.articles) ? roadmap.articles.length : 0
      })`,
    );
    return;
  }

  const versionCounts = Object.fromEntries(
    Object.keys(EXPECTED_ROADMAP_ALLOCATIONS).map((ver) => [ver, 0]),
  );
  const seenIds = new Set();
  const seenSlugs = new Set();
  const seenOrders = new Set();

  for (const item of roadmap.articles) {
    for (const key of [
      'id',
      'slug',
      'title',
      'learningObjective',
      'phpVersion',
      'category',
      'difficulty',
      'editorialStatus',
    ]) {
      if (!item[key]) {
        errors.push(`editorial-roadmap.json entry ${item.id ?? item.slug ?? 'unknown'} missing "${key}"`);
      }
    }

    if (item.id) {
      if (seenIds.has(item.id)) errors.push(`editorial-roadmap.json duplicate id "${item.id}"`);
      seenIds.add(item.id);
    }
    if (item.slug) {
      if (seenSlugs.has(item.slug)) errors.push(`editorial-roadmap.json duplicate slug "${item.slug}"`);
      seenSlugs.add(item.slug);
    }
    if (typeof item.seriesOrder !== 'number') {
      errors.push(`editorial-roadmap.json entry "${item.slug}" missing numeric seriesOrder`);
    } else if (seenOrders.has(item.seriesOrder)) {
      errors.push(`editorial-roadmap.json duplicate seriesOrder ${item.seriesOrder}`);
    } else {
      seenOrders.add(item.seriesOrder);
    }

    if (item.phpVersion) {
      if (!(item.phpVersion in EXPECTED_ROADMAP_ALLOCATIONS)) {
        errors.push(`editorial-roadmap.json unexpected phpVersion "${item.phpVersion}" on "${item.slug}"`);
      } else {
        versionCounts[item.phpVersion] += 1;
      }
    }

    if (item.editorialStatus) {
      const normalizedStatus = String(item.editorialStatus).trim().toLowerCase().replace(/\s+/g, '-');
      if (!VALID_STATUSES.has(normalizedStatus)) {
        errors.push(
          `editorial-roadmap.json invalid editorialStatus "${item.editorialStatus}" on "${item.slug}"`,
        );
      }
    }
    if (item.category && !VALID_ROADMAP_CATEGORIES.has(item.category)) {
      errors.push(`editorial-roadmap.json invalid category "${item.category}" on "${item.slug}"`);
    }
    if (
      item.technicalVerificationStatus &&
      !VALID_VERIFICATION_STATUSES.has(item.technicalVerificationStatus)
    ) {
      errors.push(
        `editorial-roadmap.json invalid technicalVerificationStatus "${item.technicalVerificationStatus}" on "${item.slug}"`,
      );
    }
  }

  for (const [ver, expectedCount] of Object.entries(EXPECTED_ROADMAP_ALLOCATIONS)) {
    if (versionCounts[ver] !== expectedCount) {
      errors.push(
        `editorial-roadmap.json PHP ${ver} allocation mismatch: expected ${expectedCount}, found ${versionCounts[ver]}`,
      );
    }
  }
}

const validSeriesIds = new Set(
  fs
    .readdirSync(seriesDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '')),
);

validateEditorialRoadmap(validSeriesIds);

const articleFiles = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

const parsedArticles = [];
const seenSlugs = new Set();

for (const file of articleFiles) {
  const slug = file.replace(/\.mdx$/, '');
  if (seenSlugs.has(slug)) {
    errors.push(`${file}: duplicate slug "${slug}"`);
  }
  seenSlugs.add(slug);

  const fullPath = path.join(articlesDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const parsed = parseFrontmatter(raw);

  if (!parsed) {
    errors.push(`${file}: missing valid YAML frontmatter block`);
    continue;
  }

  const { data, body } = parsed;
  const status = data.status ?? 'published';
  const isPublic = isPublicArticleData(data);

  for (const field of ['title', 'description', 'publishedAt', 'category']) {
    if (!data[field]) {
      errors.push(`${file}: missing required field "${field}"`);
    }
  }

  if (typeof data.title === 'string') {
    if (data.title.trim().length < 10) {
      errors.push(`${file}: title is too short (< 10 chars)`);
    } else if (data.title.trim().length > 85) {
      warnings.push(`${file}: title is ${data.title.trim().length} chars (consider <= 85 for cleaner SERP display)`);
    }
  }

  if (typeof data.description === 'string') {
    if (data.description.trim().length < 20) {
      errors.push(`${file}: description is too short (< 20 chars)`);
    } else if (data.description.trim().length < 60 || data.description.trim().length > 175) {
      warnings.push(
        `${file}: description length (${data.description.trim().length} chars) sits outside ideal 60-175 range`,
      );
    }
  }

  if (data.publishedAt && Number.isNaN(Date.parse(String(data.publishedAt)))) {
    errors.push(`${file}: invalid publishedAt date "${data.publishedAt}"`);
  }

  if (data.updatedAt && Number.isNaN(Date.parse(String(data.updatedAt)))) {
    errors.push(`${file}: invalid updatedAt date "${data.updatedAt}"`);
  }

  if (data.status && !VALID_STATUSES.has(String(data.status))) {
    errors.push(`${file}: invalid status "${data.status}"`);
  }

  if (data.sectionCategory && !VALID_SECTION_CATEGORIES.has(String(data.sectionCategory))) {
    errors.push(`${file}: invalid sectionCategory "${data.sectionCategory}"`);
  }

  if (
    data.technicalVerificationStatus &&
    !VALID_VERIFICATION_STATUSES.has(String(data.technicalVerificationStatus))
  ) {
    errors.push(`${file}: invalid technicalVerificationStatus "${data.technicalVerificationStatus}"`);
  }

  if (data.status === 'published' && data.draft === true) {
    errors.push(`${file}: contradictory metadata — status is "published" while draft is true`);
  }

  if (data.status && data.status !== 'published' && data.draft !== true) {
    errors.push(`${file}: status "${data.status}" must keep draft: true so unpublished work cannot leak into build`);
  }

  if (data.phpVersion && !/^\d+\.\d+(\+)?$/.test(String(data.phpVersion))) {
    errors.push(`${file}: invalid phpVersion format "${data.phpVersion}"`);
  }

  if (data.minimumPhpVersion && !/^\d+\.\d+$/.test(String(data.minimumPhpVersion))) {
    errors.push(`${file}: invalid minimumPhpVersion "${data.minimumPhpVersion}"`);
  }

  if (Array.isArray(data.testedPhpVersions)) {
    for (const ver of data.testedPhpVersions) {
      if (!/^\d+\.\d+(\.\d+)?(-?(alpha|beta|rc)\d*)?$/i.test(String(ver))) {
        errors.push(`${file}: invalid testedPhpVersions entry "${ver}"`);
      }
    }
  }

  if (data.series && !validSeriesIds.has(String(data.series))) {
    errors.push(`${file}: references unknown series "${data.series}"`);
  }

  if (data.examplePath && !fs.existsSync(path.join(rootDir, String(data.examplePath)))) {
    errors.push(`${file}: configured examplePath does not exist: ${data.examplePath}`);
  }

  if (data.testsPath && !fs.existsSync(path.join(rootDir, String(data.testsPath)))) {
    errors.push(`${file}: configured testsPath does not exist: ${data.testsPath}`);
  }

  if (Array.isArray(data.researchReferences)) {
    for (const ref of data.researchReferences) {
      if (!ref || typeof ref !== 'object' || !ref.title || !ref.url || !/^https?:\/\//.test(String(ref.url))) {
        errors.push(`${file}: researchReferences items must include "title" and http(s) "url"`);
      }
    }
  }

  if (isPublic && data.isSampleContent === true) {
    errors.push(`${file}: cannot be published while isSampleContent is true`);
  }

  if (isPublic && data.technicalVerificationStatus === 'awaiting-php-release') {
    errors.push(`${file}: cannot be published while technicalVerificationStatus is "awaiting-php-release"`);
  }

  if (isPublic && data.technicalVerificationStatus === 'unverified') {
    warnings.push(`${file}: published article is marked technicalVerificationStatus: "unverified"`);
  }

  const proseOnly = stripFencedCodeAndImports(body);
  const proseWords = proseOnly.trim().split(/\s+/).filter(Boolean).length;

  if (isPublic) {
    if (proseWords === 0) {
      errors.push(`${file}: published article body is empty`);
    } else if (proseWords < 120) {
      warnings.push(`${file}: published prose body is brief (${proseWords} words)`);
    }

    const placeholderChecks = [
      { pattern: /\bTODO\b/, label: 'TODO' },
      { pattern: /\bFIXME\b/, label: 'FIXME' },
      { pattern: /SAMPLE CONTENT/i, label: 'SAMPLE CONTENT' },
      { pattern: /Sample Content Notice/i, label: 'Sample Content Notice' },
      { pattern: /Replace this text/i, label: 'Replace this text' },
      { pattern: /Placeholder biography/i, label: 'Placeholder biography' },
    ];

    for (const check of placeholderChecks) {
      if (check.pattern.test(proseOnly)) {
        errors.push(`${file}: published article contains placeholder marker "${check.label}"`);
      }
    }
  } else {
    manualReviewItems.push(
      `${file}: non-public (${data.draft ? 'draft: true' : ''}, status: ${status}, verification: ${
        data.technicalVerificationStatus ?? 'unset'
      }) — excluded from site, RSS, sitemap, search, and OG assets`,
    );
  }

  parsedArticles.push({ slug, file, data, body, isPublic });
}

// Validate OG assets consistency (generated via npm run og:generate before build/check)
if (!fs.existsSync(path.join(ogDir, 'default.png'))) {
  errors.push('public/og/default.png is missing (run npm run og:generate)');
}

const seriesOrderSeen = new Map();
const publicSlugs = new Set(parsedArticles.filter((a) => a.isPublic).map((a) => a.slug));
const allSlugs = new Set(parsedArticles.map((a) => a.slug));

for (const article of parsedArticles) {
  if (article.data.series && typeof article.data.seriesOrder === 'number') {
    const key = `${article.data.series}:${article.data.seriesOrder}`;
    if (seriesOrderSeen.has(key)) {
      errors.push(
        `${article.file}: duplicate seriesOrder ${article.data.seriesOrder} in series "${article.data.series}" (conflicts with ${seriesOrderSeen.get(
          key,
        )})`,
      );
    } else {
      seriesOrderSeen.set(key, article.file);
    }
  }

  if (article.isPublic && Array.isArray(article.data.relatedArticles)) {
    for (const rel of article.data.relatedArticles) {
      if (!allSlugs.has(rel)) {
        errors.push(`${article.file}: relatedArticles references missing slug "${rel}"`);
      } else if (!publicSlugs.has(rel)) {
        errors.push(`${article.file}: published article references non-public relatedArticle "${rel}"`);
      }
    }
  }

  if (article.isPublic) {
    const linkMatches = article.body.matchAll(/\]\(\/articles\/([a-z0-9-]+)\/?\)/g);
    for (const m of linkMatches) {
      const targetSlug = m[1];
      if (!publicSlugs.has(targetSlug)) {
        errors.push(`${article.file}: internal link points to non-public or missing article "/articles/${targetSlug}/"`);
      }
    }
  }

  const ogArticleFile = path.join(ogDir, 'articles', `${article.slug}.png`);
  if (article.isPublic && !fs.existsSync(ogArticleFile)) {
    errors.push(`${article.file}: missing public OG preview public/og/articles/${article.slug}.png (run npm run og:generate)`);
  }
  if (!article.isPublic && fs.existsSync(ogArticleFile)) {
    errors.push(`${article.file}: non-public draft must not have public OG image public/og/articles/${article.slug}.png`);
  }
}

// Validate social packages if present
if (fs.existsSync(socialDir)) {
  for (const slug of fs.readdirSync(socialDir)) {
    const pkgDir = path.join(socialDir, slug);
    if (!fs.statSync(pkgDir).isDirectory()) continue;

    const xPath = path.join(pkgDir, 'x-thread.md');
    if (fs.existsSync(xPath)) {
      const md = fs.readFileSync(xPath, 'utf8');
      const matches = [...md.matchAll(/## Post (\d+)\r?\n([\s\S]*?)(?=\r?\n## Post |\s*$)/g)];
      for (const m of matches) {
        const postLen = m[2].trim().length;
        if (postLen > 280) {
          errors.push(`content/social/${slug}/x-thread.md Post ${m[1]} exceeds 280 chars (${postLen})`);
        }
      }
    }

    const metaPath = path.join(pkgDir, 'metadata.json');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        const article = parsedArticles.find((a) => a.slug === slug);
        if (article && Boolean(meta.readyForManualPosting) !== article.isPublic) {
          errors.push(
            `content/social/${slug}/metadata.json readyForManualPosting (${meta.readyForManualPosting}) disagrees with article public state (${article.isPublic})`,
          );
        }
      } catch (err) {
        errors.push(`content/social/${slug}/metadata.json invalid JSON: ${err.message}`);
      }
    }
  }
}

for (const w of warnings) {
  console.log(`[validate:articles] WARNING: ${w}`);
}

for (const item of manualReviewItems) {
  console.log(`[validate:articles] MANUAL REVIEW: ${item}`);
}

if (errors.length > 0) {
  console.error('[validate:articles] FAILED:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `[validate:articles] OK: 30-article roadmap valid; ${publicSlugs.size} published, ${
    parsedArticles.length - publicSlugs.size
  } non-public (${parsedArticles.length} total articles validated).`,
);
