import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCompatibilityDisplay,
  filterAndSortArticles,
  filterTocHeadings,
  getAdjacentArticles,
  getArticlesForSeries,
  getRelatedArticles,
  groupSeriesArticlesByPhpVersion,
  isArticlePublic,
} from '../src/lib/article-logic.ts';
import { getReadingTime } from '../src/lib/reading-time.ts';
import { formatDate, formatIsoDate } from '../src/lib/date.ts';
import {
  createKhorshedShikiTransformer,
  parseCodeFenceMeta,
  parseLineRangeMeta,
} from '../src/lib/shiki-transformer.ts';

function makeArticle(overrides = {}) {
  return {
    id: overrides.id ?? 'sample-article',
    body: overrides.body ?? 'Sample body text.',
    data: {
      title: 'Sample Title',
      description: 'Sample description with sufficient detail.',
      publishedAt: new Date('2026-11-18T00:00:00Z'),
      draft: false,
      status: 'published',
      featured: false,
      category: 'PHP',
      tags: ['php'],
      relatedArticles: [],
      ...overrides.data,
    },
  };
}

test('isArticlePublic enforces both draft=false and status=published', () => {
  assert.equal(isArticlePublic(makeArticle()), true);
  assert.equal(isArticlePublic(makeArticle({ data: { draft: true, status: 'published' } })), false);
  assert.equal(isArticlePublic(makeArticle({ data: { draft: false, status: 'draft' } })), false);
  assert.equal(isArticlePublic(makeArticle({ data: { draft: false, status: 'technical-review' } })), false);
  assert.equal(isArticlePublic(makeArticle({ data: { draft: false, status: 'ready' } })), false);
});

test('filterAndSortArticles excludes non-public articles and sorts newest-first with seriesOrder tie-break', () => {
  const a1 = makeArticle({ id: 'part-1', data: { seriesOrder: 1, publishedAt: new Date('2026-11-18') } });
  const a2 = makeArticle({ id: 'part-2', data: { seriesOrder: 2, publishedAt: new Date('2026-11-18') } });
  const draft = makeArticle({ id: 'part-3', data: { draft: true, status: 'draft', seriesOrder: 3 } });
  const review = makeArticle({ id: 'part-4', data: { status: 'technical-review', seriesOrder: 4 } });

  const sorted = filterAndSortArticles([a1, draft, a2, review]);
  assert.deepEqual(sorted.map((a) => a.id), ['part-2', 'part-1']);
});

test('getArticlesForSeries sorts strictly by seriesOrder and excludes drafts', () => {
  const part2 = makeArticle({
    id: 'part-2',
    data: { series: 'modern-php-mastery', seriesOrder: 2, phpVersion: '8.5', publishedAt: new Date('2026-11-10') },
  });
  const part1 = makeArticle({
    id: 'part-1',
    data: { series: 'modern-php-mastery', seriesOrder: 1, phpVersion: '8.4', publishedAt: new Date('2026-11-18') },
  });
  const part3Draft = makeArticle({
    id: 'part-3',
    data: { series: 'modern-php-mastery', seriesOrder: 3, phpVersion: '8.6', draft: true, status: 'draft' },
  });

  const seriesArticles = getArticlesForSeries([part2, part3Draft, part1], 'modern-php-mastery');
  assert.deepEqual(seriesArticles.map((a) => a.id), ['part-1', 'part-2']);

  const grouped = groupSeriesArticlesByPhpVersion(seriesArticles);
  assert.deepEqual(
    grouped.map((g) => ({ version: g.version, count: g.articles.length })),
    [
      { version: '8.4', count: 1 },
      { version: '8.5', count: 1 },
    ],
  );
});

test('getAdjacentArticles returns accurate previous/next links and boundary undefineds', () => {
  const p1 = makeArticle({ id: 'p1' });
  const p2 = makeArticle({ id: 'p2' });
  const p3 = makeArticle({ id: 'p3' });

  const first = getAdjacentArticles([p1, p2, p3], 'p1');
  assert.equal(first.previous, undefined);
  assert.equal(first.next?.id, 'p2');

  const middle = getAdjacentArticles([p1, p2, p3], 'p2');
  assert.equal(middle.previous?.id, 'p1');
  assert.equal(middle.next?.id, 'p3');

  const last = getAdjacentArticles([p1, p2, p3], 'p3');
  assert.equal(last.previous?.id, 'p2');
  assert.equal(last.next, undefined);
});

test('getRelatedArticles never exposes draft or review articles even when explicitly referenced', () => {
  const current = makeArticle({
    id: 'current',
    data: { series: 'modern-php-mastery', relatedArticles: ['draft-secret', 'pub-2'] },
  });
  const draftSecret = makeArticle({
    id: 'draft-secret',
    data: { series: 'modern-php-mastery', draft: true, status: 'draft' },
  });
  const pub2 = makeArticle({ id: 'pub-2', data: { series: 'modern-php-mastery' } });

  const related = getRelatedArticles([current, draftSecret, pub2], current, 3);
  assert.deepEqual(related.map((a) => a.id), ['pub-2']);
});

test('getReadingTime handles empty bodies, prose, and fenced code blocks', () => {
  assert.deepEqual(getReadingTime(undefined), { minutes: 1, words: 0, label: '1 min read' });
  const longProse = Array.from({ length: 450 }, () => 'word').join(' ');
  const res = getReadingTime(longProse);
  assert.equal(res.minutes, 3);
  assert.equal(res.label, '3 min read');
});

test('date formatting renders UTC ISO and display strings consistently', () => {
  const d = new Date('2026-11-18T00:00:00.000Z');
  assert.equal(formatDate(d), 'Nov 18, 2026');
  assert.equal(formatIsoDate(d), '2026-11-18T00:00:00.000Z');
});

test('buildCompatibilityDisplay omits empty optional metadata and formats labels clearly', () => {
  const empty = buildCompatibilityDisplay({});
  assert.equal(empty.hasData, false);

  const partial = buildCompatibilityDisplay({
    phpVersion: '8.4',
    minimumPhpVersion: '8.4',
    testedPhpVersions: ['8.4.27', '8.5.12'],
    requiredExtensions: [],
  });
  assert.equal(partial.hasData, true);
  assert.equal(partial.introducedIn, '8.4');
  assert.equal(partial.minimumPhpVersion, '8.4');
  assert.deepEqual(partial.testedPhpVersions, ['8.4.27', '8.5.12']);
  assert.equal(partial.requiredExtensionsLabel, 'None');
});

test('filterTocHeadings keeps h2/h3 headings and deduplicates slugs', () => {
  const filtered = filterTocHeadings([
    { depth: 1, slug: 'title', text: 'Title' },
    { depth: 2, slug: 'intro', text: 'Intro' },
    { depth: 3, slug: 'details', text: 'Details' },
    { depth: 3, slug: 'details', text: 'Duplicate Details' },
    { depth: 4, slug: 'deep', text: 'Too Deep' },
  ]);
  assert.deepEqual(
    filtered.map((h) => h.slug),
    ['intro', 'details'],
  );
});

test('Shiki meta parser and transformer support highlight ranges, line numbers, missing labels, and diff markers', () => {
  assert.deepEqual([...parseLineRangeMeta('highlight={2,4-6}')], [2, 4, 5, 6]);
  assert.deepEqual([...parseLineRangeMeta('')], []);

  const meta = parseCodeFenceMeta('title="src/Demo.php" php="8.4" showLineNumbers highlight={1,3-4} caption="Test caption"');
  assert.equal(meta.title, 'src/Demo.php');
  assert.equal(meta.phpVersion, '8.4');
  assert.equal(meta.showLineNumbers, true);
  assert.equal(meta.caption, 'Test caption');
  assert.deepEqual([...meta.highlightLines], [1, 3, 4]);

  const missingMeta = parseCodeFenceMeta(undefined);
  assert.equal(missingMeta.title, undefined);
  assert.equal(missingMeta.showLineNumbers, false);
  assert.equal(missingMeta.highlightLines.size, 0);

  // Verify Shiki transformer strips // [!code ++] cleanly and annotates line node
  const transformer = createKhorshedShikiTransformer({ showLineNumbers: true, highlightLines: [2] });
  const preNode = { type: 'element', tagName: 'pre', properties: {}, children: [] };
  transformer.pre.call({ options: { lang: 'php', meta: { __raw: '' } } }, preNode);
  assert.equal(preNode.properties['data-language'], 'php');
  assert.equal(preNode.properties['data-line-numbers'], 'true');

  const lineNode = {
    type: 'element',
    tagName: 'span',
    properties: { class: 'line' },
    children: [{ type: 'text', value: '$x = 1; // [!code ++]' }],
  };
  const addedClasses = [];
  transformer.line.call(
    {
      options: { meta: { __raw: '' } },
      addClassToHast(_n, cls) {
        addedClasses.push(cls);
      },
    },
    lineNode,
    2,
  );
  assert.equal(lineNode.children[0].value, '$x = 1;');
  assert.equal(lineNode.properties['data-diff'], '+');
  assert.equal(lineNode.properties['data-highlighted'], 'true');
  assert.ok(addedClasses.includes('highlighted'));
  assert.ok(addedClasses.includes('diff-add'));
});
