import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

test('production build emits Phase 3 features and excludes drafts across HTML, RSS, and sitemap', () => {
  assert.equal(fs.existsSync(distDir), true, 'dist/ directory must exist (run npm run build first)');

  const propHooksPath = path.join(distDir, 'articles/php-84-property-hooks/index.html');
  assert.equal(fs.existsSync(propHooksPath), true, 'PHP 8.4 demonstration article must be built');

  const propHooksHtml = fs.readFileSync(propHooksPath, 'utf8');

  // CodeComparison rendered side-by-side panels and copy buttons
  assert.match(propHooksHtml, /data-comparison-panel="before"/);
  assert.match(propHooksHtml, /data-comparison-panel="after"/);
  assert.match(propHooksHtml, /PHP 8\.3/);
  assert.match(propHooksHtml, /PHP 8\.4/);

  // Callouts rendered
  assert.match(propHooksHtml, /data-callout="compatibility"/);
  assert.match(propHooksHtml, /data-callout="warning"/);
  assert.match(propHooksHtml, /data-callout="performance"/);
  assert.match(propHooksHtml, /data-callout="tip"/);
  assert.match(propHooksHtml, /data-callout="best-practice"/);

  // PhpCompatibility metadata rendered
  assert.match(propHooksHtml, /Minimum PHP:/);
  assert.match(propHooksHtml, /Tested on:/);
  assert.match(propHooksHtml, /8\.4\.27, 8\.5\.12/);

  // Reading progress bar & TOC
  assert.match(propHooksHtml, /id="reading-progress-bar"/);
  assert.match(propHooksHtml, /id="article-content-body"/);
  assert.match(propHooksHtml, /data-toc-link=/);

  // Enhanced code block features: line numbers, highlighted lines, diff markers, caption
  assert.match(propHooksHtml, /data-line-numbers="true"/);
  assert.match(propHooksHtml, /data-highlighted="true"/);
  assert.match(propHooksHtml, /data-diff="\+"/);
  assert.match(propHooksHtml, /data-diff="-"/);
  assert.match(propHooksHtml, /data-caption=/);
  assert.doesNotMatch(propHooksHtml, /\[!code \+\+\]/);
  assert.doesNotMatch(propHooksHtml, /\[!code --\]/);
  assert.doesNotMatch(propHooksHtml, /\[!code highlight\]/);

  // Source example path shown without inventing a GitHub URL
  assert.match(propHooksHtml, /examples\/php-8-4\/property-hooks\//);
  assert.match(propHooksHtml, /examples\/php-8-4\/property-hooks\/tests\/PropertyHooksTest\.php/);

  // Author signature present
  assert.match(propHooksHtml, /Written by/);

  // Mobile breadcrumb hides Home & Series on mobile while keeping full trail on sm+
  assert.match(propHooksHtml, /Articles/);
  assert.match(propHooksHtml, /PHP 8\.4 Property Hooks/);

  // Draft article excluded from dist, RSS, and sitemap
  assert.equal(
    fs.existsSync(path.join(distDir, 'articles/php-86-partial-function-application/index.html')),
    false,
    'Draft PHP 8.6 article must NOT be emitted in dist/',
  );

  const rss = fs.readFileSync(path.join(distDir, 'rss.xml'), 'utf8');
  const sitemap = fs.readFileSync(path.join(distDir, 'sitemap-0.xml'), 'utf8');
  assert.doesNotMatch(rss, /php-86-partial-function-application/);
  assert.doesNotMatch(sitemap, /php-86-partial-function-application/);
  assert.doesNotMatch(rss, /php-86-release-overview/);
  assert.doesNotMatch(sitemap, /php-86-release-overview/);
});

test('Phase 4 build emits search-index.json, interactive /articles/ filters, and 1200x630 OG images with zero draft leaks', () => {
  // 1. search-index.json includes published articles and excludes drafts
  const searchIndexPath = path.join(distDir, 'search-index.json');
  assert.equal(fs.existsSync(searchIndexPath), true, 'dist/search-index.json must be built');

  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
  assert.equal(typeof searchIndex.count, 'number');
  assert.ok(Array.isArray(searchIndex.items) && searchIndex.items.length >= 2);
  assert.equal(searchIndex.count, searchIndex.items.length);

  const indexSlugs = new Set(searchIndex.items.map((entry) => entry.slug));
  assert.equal(indexSlugs.has('php-84-property-hooks'), true);
  assert.equal(indexSlugs.has('php-85-pipe-operator'), true);
  assert.equal(indexSlugs.has('php-86-release-overview'), false);
  assert.equal(indexSlugs.has('php-86-partial-function-application'), false);

  const pipeEntry = searchIndex.items.find((e) => e.slug === 'php-85-pipe-operator');
  assert.equal(pipeEntry.phpVersion, '8.5');
  assert.equal(pipeEntry.sectionCategory, 'Functional Programming');
  assert.equal(pipeEntry.difficulty, 'Intermediate');
  assert.ok(Array.isArray(pipeEntry.headings) && pipeEntry.headings.length > 0);
  assert.ok(pipeEntry.readingTime);

  // 2. /articles/ index page contains search input and facet filter controls
  const articlesHtml = fs.readFileSync(path.join(distDir, 'articles/index.html'), 'utf8');
  assert.match(articlesHtml, /id="article-search-input"/);
  assert.match(articlesHtml, /data-filter-group="php"/);
  assert.match(articlesHtml, /data-filter-group="category"/);
  assert.match(articlesHtml, /id="article-filter-status"/);
  assert.match(articlesHtml, /id="article-filters-reset"/);
  assert.doesNotMatch(articlesHtml, /php-86-release-overview/);
  assert.doesNotMatch(articlesHtml, /php-86-partial-function-application/);

  // 3. OG PNG assets exist for default and published articles only (no drafts)
  assert.equal(fs.existsSync(path.join(distDir, 'og/default.png')), true);
  assert.equal(fs.existsSync(path.join(distDir, 'og/articles/php-84-property-hooks.png')), true);
  assert.equal(fs.existsSync(path.join(distDir, 'og/articles/php-85-pipe-operator.png')), true);
  assert.equal(fs.existsSync(path.join(distDir, 'og/articles/php-86-release-overview.png')), false);
  assert.equal(fs.existsSync(path.join(distDir, 'og/articles/php-86-partial-function-application.png')), false);

  // 4. Built article HTML emits 1200x630 Open Graph metadata & twitter summary_large_image
  const propHooksHtml = fs.readFileSync(
    path.join(distDir, 'articles/php-84-property-hooks/index.html'),
    'utf8',
  );
  assert.match(propHooksHtml, /\/og\/articles\/php-84-property-hooks\.png/);
  assert.match(propHooksHtml, /property="og:image:width"\s+content="1200"/);
  assert.match(propHooksHtml, /property="og:image:height"\s+content="630"/);
  assert.match(propHooksHtml, /name="twitter:card"\s+content="summary_large_image"/);

  // 5. No draft HTML directory emitted for either PHP 8.6 draft
  assert.equal(fs.existsSync(path.join(distDir, 'articles/php-86-release-overview/index.html')), false);
  assert.equal(
    fs.existsSync(path.join(distDir, 'articles/php-86-partial-function-application/index.html')),
    false,
  );
});
