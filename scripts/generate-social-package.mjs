#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  extractBodyHeadings,
  isPublicArticleData,
  parseFrontmatter,
} from './lib/frontmatter.mjs';
import { buildSocialTrackingUrl } from '../src/lib/utm.ts';

const SITE_ORIGIN = 'https://khorshed.pro';
const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'src/content/articles');
const socialRootDir = path.join(rootDir, 'content/social');

function parseCliArgs(argv) {
  const args = { all: false, force: false, slug: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') {
      args.all = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--slug' && argv[i + 1]) {
      args.slug = argv[++i];
    } else if (arg.startsWith('--slug=')) {
      args.slug = arg.slice('--slug='.length);
    } else if (!arg.startsWith('-') && !args.slug) {
      args.slug = arg;
    }
  }
  return args;
}

function fitTweet(text, maxLen = 280) {
  const normalized = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 3).trimEnd()}...`;
}

function formatHeadingBullets(headings) {
  const selected = headings.slice(0, 4);
  if (selected.length === 0) {
    return '- Core syntax rules and practical engineering trade-offs';
  }
  return selected.map((heading) => `- ${heading}`).join('\n');
}

function buildSocialFiles(slug, data, body) {
  const isPublic = isPublicArticleData(data);
  const articleStatus = data.status ?? (data.draft ? 'draft' : 'published');
  const phpVersion = data.phpVersion ?? 'PHP 8.x';
  const title = data.title ?? slug;
  const description = data.description ?? '';
  const verification = data.technicalVerificationStatus ?? 'unverified';
  const headings = extractBodyHeadings(body);
  const canonicalUrl = `${SITE_ORIGIN}/articles/${slug}/`;

  const utmLinks = {
    linkedin: buildSocialTrackingUrl({
      articleUrl: canonicalUrl,
      platform: 'linkedin',
      campaign: 'modern-php-mastery',
      content: slug,
    }),
    facebook: buildSocialTrackingUrl({
      articleUrl: canonicalUrl,
      platform: 'facebook',
      campaign: 'modern-php-mastery',
      content: slug,
    }),
    x: buildSocialTrackingUrl({
      articleUrl: canonicalUrl,
      platform: 'x',
      campaign: 'modern-php-mastery',
      content: slug,
    }),
  };

  const statusBanner = isPublic
    ? '> Status: **READY FOR MANUAL POSTING** (Article is published; copy manually to publish.)'
    : `> Status: **DRAFT / DO NOT PUBLISH YET** (Article status: \`${articleStatus}\`, draft: \`${Boolean(
        data.draft,
      )}\`, verification: \`${verification}\`). Only post after technical review and article publication.`;

  const linkedin = `# LinkedIn Post Package — ${title}

${statusBanner}

---

Most codebases end up carrying extra boilerplate or deeply nested wrappers because older PHP versions gave us no cleaner language-level primitive.

In my ${phpVersion} article, **${title}**, I break down how the feature works under the hood, where traditional approaches fall short, and what constraints to check before adopting it in production.

What the article covers:
${formatHeadingBullets(headings)}

The goal of the **Modern PHP Mastery: 8.0 -> 8.6** series is not to summarize release notes, but to examine each feature alongside before/after code comparisons, edge cases, and verifiable examples.

${
  isPublic
    ? `Read the full article and inspect the verified PHP examples:\n${utmLinks.linkedin}`
    : `[Publish target once article goes live]:\n${utmLinks.linkedin}`
}

Which part of ${phpVersion} is shaping how your team writes PHP right now?

#PHP #ModernPHP #SoftwareEngineering #BackendDevelopment
`;

  const facebook = `# Facebook Post Package — ${title}

${statusBanner}

---

${description}

In **${title}** (part of *Modern PHP Mastery: 8.0 -> 8.6* on khorshed.pro), we look at ${phpVersion} through side-by-side code comparisons and practical rules:

${formatHeadingBullets(headings)}

${
  isPublic
    ? `Full guide with copy-ready examples and compatibility notes:\n${utmLinks.facebook}`
    : `[Target URL after publication and runtime verification]:\n${utmLinks.facebook}`
}
`;

  const tweets = [
    fitTweet(
      `1/4 ${title}\n\n${description} A breakdown from Modern PHP Mastery (${phpVersion}).`,
    ),
    fitTweet(
      `2/4 Key areas covered in the article:\n${headings
        .slice(0, 3)
        .map((h) => `- ${h}`)
        .join('\n') || '- Before/after comparisons and production edge cases'}`,
    ),
    fitTweet(
      `3/4 Focus: understanding where ${phpVersion} improves clarity and maintainability, and where existing patterns still make sense.`,
    ),
    fitTweet(
      isPublic
        ? `4/4 Read the full guide with side-by-side examples:\n${utmLinks.x}`
        : `4/4 [Draft — hold until published & verified]\n${utmLinks.x}`,
    ),
  ];

  const xThread = `# X Thread Package — ${title}

${statusBanner}

> Every post below is validated at <= 280 characters.

## Post 1
${tweets[0]}

## Post 2
${tweets[1]}

## Post 3
${tweets[2]}

## Post 4
${tweets[3]}
`;

  const metadata = {
    slug,
    title,
    phpVersion,
    series: data.series ?? 'modern-php-mastery',
    articleStatus,
    draft: Boolean(data.draft),
    technicalVerificationStatus: verification,
    readyForManualPosting: isPublic,
    canonicalUrl,
    ogImagePath: isPublic ? `/og/articles/${slug}.png` : '/og/default.png',
    utmLinks,
    xPostCharCounts: tweets.map((tweet, index) => ({
      post: index + 1,
      length: tweet.length,
      withinLimit: tweet.length <= 280,
    })),
    generatedAt: new Date().toISOString().slice(0, 10),
    automationMode: 'manual-copy-only',
  };

  return { linkedin, facebook, xThread, metadata };
}

function writePackageForSlug(slug, force = false) {
  const mdxPath = path.join(articlesDir, `${slug}.mdx`);
  if (!fs.existsSync(mdxPath)) {
    throw new Error(`Article not found: src/content/articles/${slug}.mdx`);
  }

  const raw = fs.readFileSync(mdxPath, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    throw new Error(`Invalid frontmatter in src/content/articles/${slug}.mdx`);
  }

  const outDir = path.join(socialRootDir, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const { linkedin, facebook, xThread, metadata } = buildSocialFiles(
    slug,
    parsed.data,
    parsed.body,
  );

  const outputs = [
    ['linkedin.md', linkedin],
    ['facebook.md', facebook],
    ['x-thread.md', xThread],
    ['metadata.json', `${JSON.stringify(metadata, null, 2)}\n`],
  ];

  const written = [];
  const skipped = [];

  for (const [filename, content] of outputs) {
    const dest = path.join(outDir, filename);
    if (fs.existsSync(dest) && !force) {
      skipped.push(filename);
      continue;
    }
    fs.writeFileSync(dest, content, 'utf8');
    written.push(filename);
  }

  return { slug, written, skipped };
}

const args = parseCliArgs(process.argv.slice(2));

if (args.help || (!args.all && !args.slug)) {
  console.log(
    `Usage:
  npm run social:generate -- --slug <article-slug> [--force]
  npm run social:generate -- --all [--force]
`,
  );
  process.exit(args.help ? 0 : 1);
}

const slugs = args.all
  ? fs
      .readdirSync(articlesDir)
      .filter((file) => file.endsWith('.mdx') && !file.startsWith('_'))
      .map((file) => file.replace(/\.mdx$/, ''))
  : [args.slug];

for (const slug of slugs) {
  const result = writePackageForSlug(slug, args.force);
  console.log(
    `[social:generate] ${result.slug}: written=${result.written.length} skipped=${result.skipped.length}`,
  );
}
