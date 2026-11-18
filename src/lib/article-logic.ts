export type ArticleStatus = 'draft' | 'technical-review' | 'ready' | 'published';

export interface ArticleLike {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    publishedAt: Date;
    updatedAt?: Date;
    draft: boolean;
    status?: ArticleStatus;
    featured: boolean;
    category: string;
    tags: string[];
    series?: string;
    seriesOrder?: number;
    phpVersion?: string;
    minimumPhpVersion?: string;
    testedPhpVersions?: string[];
    deprecatedIn?: string;
    removedIn?: string;
    requiredExtensions?: string[];
    relatedArticles: string[];
  };
}

export interface PhpVersionGroupLike<T extends ArticleLike> {
  version: string;
  label: string;
  articles: T[];
}

export interface CompatibilityDisplay {
  hasData: boolean;
  introducedIn?: string;
  minimumPhpVersion?: string;
  testedPhpVersions: string[];
  requiredExtensionsLabel: string;
  deprecatedIn?: string;
  removedIn?: string;
}

export function isArticlePublic<T extends ArticleLike>(entry: T): boolean {
  const status = entry.data.status ?? 'published';
  return !entry.data.draft && status === 'published';
}

export function filterAndSortArticles<T extends ArticleLike>(
  articles: T[],
  options?: { excludeNonPublic?: boolean },
): T[] {
  const shouldFilter = options?.excludeNonPublic ?? true;

  return articles
    .filter((entry) => (shouldFilter ? isArticlePublic(entry) : true))
    .sort((a, b) => {
      const dateDiff = b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.data.seriesOrder ?? 0) - (a.data.seriesOrder ?? 0);
    });
}

export function getArticlesForSeries<T extends ArticleLike>(
  articles: T[],
  seriesId: string,
): T[] {
  return articles
    .filter((article) => article.data.series === seriesId && isArticlePublic(article))
    .sort((a, b) => {
      const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.data.publishedAt.getTime() - b.data.publishedAt.getTime();
    });
}

export function groupSeriesArticlesByPhpVersion<T extends ArticleLike>(
  seriesArticles: T[],
): PhpVersionGroupLike<T>[] {
  const groups = new Map<string, T[]>();

  for (const article of seriesArticles) {
    const key = article.data.phpVersion ?? 'General';
    const existing = groups.get(key) ?? [];
    existing.push(article);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([version, articles]) => ({
    version,
    label: version === 'General' ? 'Core Concepts' : `PHP ${version}`,
    articles,
  }));
}

export function getAdjacentArticles<T extends ArticleLike>(
  sortedArticles: T[],
  currentId: string,
): { previous: T | undefined; next: T | undefined } {
  const index = sortedArticles.findIndex((article) => article.id === currentId);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: index > 0 ? sortedArticles[index - 1] : undefined,
    next: index < sortedArticles.length - 1 ? sortedArticles[index + 1] : undefined,
  };
}

export function getRelatedArticles<T extends ArticleLike>(
  allArticles: T[],
  current: T,
  limit = 3,
): T[] {
  const candidates = allArticles.filter(
    (article) => article.id !== current.id && isArticlePublic(article),
  );
  const selected: T[] = [];
  const seen = new Set<string>();

  for (const explicitId of current.data.relatedArticles) {
    const match = candidates.find((article) => article.id === explicitId);
    if (match && !seen.has(match.id)) {
      selected.push(match);
      seen.add(match.id);
    }
  }

  if (selected.length < limit) {
    const currentTags = new Set(current.data.tags.map((t) => t.toLowerCase()));
    const scored = candidates
      .filter((article) => !seen.has(article.id))
      .map((article) => {
        let score = 0;
        if (current.data.series && article.data.series === current.data.series) {
          score += 3;
        }
        if (article.data.category === current.data.category) {
          score += 2;
        }
        for (const tag of article.data.tags) {
          if (currentTags.has(tag.toLowerCase())) {
            score += 1;
          }
        }
        return { article, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const item of scored) {
      if (selected.length >= limit) break;
      selected.push(item.article);
      seen.add(item.article.id);
    }
  }

  return selected.slice(0, limit);
}

export function getUniqueTags<T extends ArticleLike>(articles: T[]): string[] {
  const tags = new Set<string>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function getUniqueCategories<T extends ArticleLike>(articles: T[]): string[] {
  const categories = new Set<string>();
  for (const article of articles) {
    categories.add(article.data.category);
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export function buildCompatibilityDisplay(data: {
  phpVersion?: string;
  minimumPhpVersion?: string;
  testedPhpVersions?: string[];
  requiredExtensions?: string[];
  deprecatedIn?: string;
  removedIn?: string;
}): CompatibilityDisplay {
  const tested = data.testedPhpVersions ?? [];
  const extensions = data.requiredExtensions ?? [];
  const hasData = Boolean(
    data.phpVersion ||
      data.minimumPhpVersion ||
      tested.length > 0 ||
      extensions.length > 0 ||
      data.deprecatedIn ||
      data.removedIn,
  );

  return {
    hasData,
    introducedIn: data.phpVersion,
    minimumPhpVersion: data.minimumPhpVersion,
    testedPhpVersions: tested,
    requiredExtensionsLabel: extensions.length > 0 ? extensions.join(', ') : 'None',
    deprecatedIn: data.deprecatedIn,
    removedIn: data.removedIn,
  };
}

export interface HeadingLike {
  depth: number;
  slug: string;
  text: string;
}

export function filterTocHeadings<T extends HeadingLike>(
  headings: T[],
  minDepth = 2,
  maxDepth = 3,
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const heading of headings) {
    if (heading.depth < minDepth || heading.depth > maxDepth) continue;
    if (!heading.slug || seen.has(heading.slug)) continue;
    seen.add(heading.slug);
    result.push(heading);
  }

  return result;
}
