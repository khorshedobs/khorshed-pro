#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'src/content/articles');
const seriesDir = path.join(rootDir, 'src/content/series');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  const yamlText = match[1];
  const body = match[2];
  const data = {};
  const lines = yamlText.split(/\r?\n/);
  let currentArrayKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const arrayItem = line.match(/^\s+-\s+(.*)$/);
    if (arrayItem && currentArrayKey) {
      data[currentArrayKey].push(stripQuotes(arrayItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      currentArrayKey = null;
      continue;
    }

    const [, key, rawValue] = kv;
    const val = rawValue.trim();

    if (val === '' || val === '[]') {
      data[key] = [];
      currentArrayKey = val === '' ? key : null;
    } else if (val === 'true') {
      data[key] = true;
      currentArrayKey = null;
    } else if (val === 'false') {
      data[key] = false;
      currentArrayKey = null;
    } else if (/^\d+$/.test(val)) {
      data[key] = Number.parseInt(val, 10);
      currentArrayKey = null;
    } else if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((item) => stripQuotes(item.trim()))
        : [];
      currentArrayKey = null;
    } else {
      data[key] = stripQuotes(val);
      currentArrayKey = null;
    }
  }

  return { data, body };
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function stripFencedCodeAndImports(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<CodeComparison[\s\S]*?\/>/g, '')
    .replace(/`[^`]+`/g, '');
}

const validSeriesIds = new Set(
  fs
    .readdirSync(seriesDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '')),
);

const articleFiles = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

const parsedArticles = [];
const errors = [];
const warnings = [];

for (const file of articleFiles) {
  const slug = file.replace(/\.mdx$/, '');
  const fullPath = path.join(articlesDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const parsed = parseFrontmatter(raw);

  if (!parsed) {
    errors.push(`${file}: missing valid YAML frontmatter block`);
    continue;
  }

  const { data, body } = parsed;
  const status = data.status ?? 'published';
  const isPublic = data.draft !== true && status === 'published';

  // Required fields
  for (const field of ['title', 'description', 'publishedAt', 'category']) {
    if (!data[field]) {
      errors.push(`${file}: missing required field "${field}"`);
    }
  }

  if (data.publishedAt && Number.isNaN(Date.parse(String(data.publishedAt)))) {
    errors.push(`${file}: invalid publishedAt date "${data.publishedAt}"`);
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

  if (isPublic && data.isSampleContent === true) {
    errors.push(`${file}: cannot be published while isSampleContent is true`);
  }

  if (isPublic) {
    const proseOnly = stripFencedCodeAndImports(body);
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
    warnings.push(`${file}: non-public (${data.draft ? 'draft: true' : `status: ${status}`}) — excluded from build`);
  }

  parsedArticles.push({ slug, file, data, body, isPublic });
}

// Check seriesOrder uniqueness & cross-article links among public articles
const seriesOrderSeen = new Map();
const publicSlugs = new Set(parsedArticles.filter((a) => a.isPublic).map((a) => a.slug));
const allSlugs = new Set(parsedArticles.map((a) => a.slug));

for (const article of parsedArticles) {
  if (article.isPublic && article.data.series && typeof article.data.seriesOrder === 'number') {
    const key = `${article.data.series}:${article.data.seriesOrder}`;
    if (seriesOrderSeen.has(key)) {
      errors.push(
        `${article.file}: duplicate seriesOrder ${article.data.seriesOrder} in series "${article.data.series}" (conflicts with ${seriesOrderSeen.get(key)})`,
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
}

for (const w of warnings) {
  console.log(`[validate:articles] INFO: ${w}`);
}

if (errors.length > 0) {
  console.error('[validate:articles] FAILED:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `[validate:articles] OK: ${publicSlugs.size} published, ${parsedArticles.length - publicSlugs.size} non-public (${parsedArticles.length} total articles validated).`,
);
