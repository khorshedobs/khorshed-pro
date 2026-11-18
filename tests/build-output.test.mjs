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
});
