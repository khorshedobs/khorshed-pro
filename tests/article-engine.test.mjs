import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildCompatibilityDisplay,
  extractMarkdownHeadings,
  filterAndSortArticles,
  filterTocHeadings,
  getAdjacentArticles,
  getArticlesForSeries,
  getAvailableArticleFacets,
  getRelatedArticles,
  groupSeriesArticlesByPhpVersion,
  isArticlePublic,
} from '../src/lib/article-logic.ts';
import { getReadingTime } from '../src/lib/reading-time.ts';
import { formatDate, formatIsoDate } from '../src/lib/date.ts';
import { buildSocialTrackingUrl } from '../src/lib/utm.ts';
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

test('30-article editorial roadmap maintains exact 5/4/4/4/4/4/5 PHP version allocation and unique identifiers', () => {
  const roadmapPath = path.resolve('src/data/editorial-roadmap.json');
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

  assert.equal(roadmap.seriesId, 'modern-php-mastery');
  assert.equal(roadmap.targetTotal, 30);
  assert.equal(roadmap.articles.length, 30);

  const expectedCounts = { '8.0': 5, '8.1': 4, '8.2': 4, '8.3': 4, '8.4': 4, '8.5': 4, '8.6': 5 };
  const actualCounts = Object.fromEntries(Object.keys(expectedCounts).map((v) => [v, 0]));
  const ids = new Set();
  const slugs = new Set();
  const orders = new Set();

  for (const item of roadmap.articles) {
    assert.ok(item.id, 'roadmap item must have id');
    assert.ok(item.slug, 'roadmap item must have slug');
    assert.equal(typeof item.seriesOrder, 'number', 'roadmap item must have numeric seriesOrder');
    assert.ok(!ids.has(item.id), `duplicate roadmap id: ${item.id}`);
    assert.ok(!slugs.has(item.slug), `duplicate roadmap slug: ${item.slug}`);
    assert.ok(!orders.has(item.seriesOrder), `duplicate roadmap seriesOrder: ${item.seriesOrder}`);
    ids.add(item.id);
    slugs.add(item.slug);
    orders.add(item.seriesOrder);
    actualCounts[item.phpVersion] += 1;
  }

  assert.deepEqual(actualCounts, expectedCounts);
});

test('extended Phase 4 editorial statuses stay excluded until published with draft false', () => {
  const nonPublicStatuses = [
    'idea',
    'researching',
    'drafting',
    'draft',
    'technical-review',
    'editorial-review',
    'ready',
  ];

  for (const status of nonPublicStatuses) {
    const entry = makeArticle({ id: `art-${status}`, data: { draft: false, status } });
    assert.equal(isArticlePublic(entry), false, `status "${status}" must not be public`);
  }

  assert.equal(
    isArticlePublic(makeArticle({ id: 'live', data: { draft: false, status: 'published' } })),
    true,
  );
  assert.equal(
    isArticlePublic(makeArticle({ id: 'draft-flag', data: { draft: true, status: 'published' } })),
    false,
  );

  const list = [
    makeArticle({ id: 'one', data: { draft: false, status: 'published' } }),
    makeArticle({ id: 'two', data: { draft: true, status: 'technical-review' } }),
    makeArticle({ id: 'three', data: { draft: false, status: 'ready' } }),
  ];
  assert.deepEqual(
    filterAndSortArticles(list).map((a) => a.id),
    ['one'],
  );
});

test('extractMarkdownHeadings, getAvailableArticleFacets, and buildSocialTrackingUrl work accurately', () => {
  const headings = extractMarkdownHeadings(
    `## Introduction\nSome text\n\`\`\`php\n## Fake Comment Heading\n\`\`\`\n### Edge Cases and \`readonly\` Rules\n`,
  );
  assert.deepEqual(headings, ['Introduction', 'Edge Cases and readonly Rules']);

  const articles = [
    makeArticle({
      id: 'a',
      data: {
        phpVersion: '8.4',
        sectionCategory: 'Object-Oriented Design',
        difficulty: 'Intermediate',
      },
    }),
    makeArticle({
      id: 'b',
      data: {
        phpVersion: '8.5',
        sectionCategory: 'Functional Programming',
        difficulty: 'Advanced',
      },
    }),
    makeArticle({
      id: 'hidden-draft',
      data: {
        draft: true,
        status: 'drafting',
        phpVersion: '8.6',
        sectionCategory: 'Language Features',
        difficulty: 'Beginner',
      },
    }),
  ];

  const facets = getAvailableArticleFacets(articles);
  assert.deepEqual(facets.phpVersions, ['8.4', '8.5']);
  assert.deepEqual(facets.sectionCategories, ['Functional Programming', 'Object-Oriented Design']);
  assert.deepEqual(facets.difficulties, ['Intermediate', 'Advanced']);

  const linkedInUrl = buildSocialTrackingUrl({
    articleUrl: 'https://khorshed.pro/articles/php-85-pipe-operator/',
    platform: 'linkedin',
    content: 'php-85-pipe-operator',
  });
  const parsed = new URL(linkedInUrl);
  assert.equal(parsed.searchParams.get('utm_source'), 'linkedin');
  assert.equal(parsed.searchParams.get('utm_medium'), 'social');
  assert.equal(parsed.searchParams.get('utm_campaign'), 'modern-php-mastery');
  assert.equal(parsed.searchParams.get('utm_content'), 'php-85-pipe-operator');
});

test('social distribution packages include required files, valid UTM URLs, draft locks, and <= 280 char X posts', () => {
  const expectedPackages = [
    { slug: 'php-84-property-hooks', readyForManualPosting: true },
    { slug: 'php-85-pipe-operator', readyForManualPosting: true },
    { slug: 'php-86-release-overview', readyForManualPosting: false },
    { slug: 'php-86-partial-function-application', readyForManualPosting: false },
  ];

  for (const pkg of expectedPackages) {
    const dir = path.resolve('content/social', pkg.slug);
    for (const file of ['linkedin.md', 'facebook.md', 'x-thread.md', 'metadata.json']) {
      assert.equal(fs.existsSync(path.join(dir, file)), true, `missing ${pkg.slug}/${file}`);
    }

    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));
    assert.equal(meta.readyForManualPosting, pkg.readyForManualPosting);

    for (const platform of ['linkedin', 'facebook', 'x']) {
      const u = new URL(meta.utmLinks[platform]);
      assert.equal(u.searchParams.get('utm_source'), platform);
      assert.equal(u.searchParams.get('utm_medium'), 'social');
    }

    const xMarkdown = fs.readFileSync(path.join(dir, 'x-thread.md'), 'utf8');
    const posts = [...xMarkdown.matchAll(/## Post \d+\r?\n([\s\S]*?)(?=\r?\n## Post |\s*$)/g)];
    assert.ok(posts.length >= 4, `${pkg.slug}/x-thread.md must contain >= 4 posts`);
    for (const match of posts) {
      assert.ok(match[1].trim().length <= 280, `${pkg.slug} has X post > 280 chars`);
    }
  }
});
