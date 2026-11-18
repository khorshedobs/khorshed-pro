import { getCollection, type CollectionEntry } from 'astro:content';
import {
  filterAndSortArticles,
  getArticlesForSeries,
  groupSeriesArticlesByPhpVersion,
  getAdjacentArticles,
  getRelatedArticles,
  getUniqueTags,
  getUniqueCategories,
  getAvailableArticleFacets,
  extractMarkdownHeadings,
  isArticlePublic,
  buildCompatibilityDisplay,
  filterTocHeadings,
  type PhpVersionGroupLike,
} from './article-logic';

export type ArticleEntry = CollectionEntry<'articles'>;
export type SeriesEntry = CollectionEntry<'series'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export type PhpVersionGroup = PhpVersionGroupLike<ArticleEntry>;

export {
  isArticlePublic,
  getArticlesForSeries,
  groupSeriesArticlesByPhpVersion,
  getAdjacentArticles,
  getRelatedArticles,
  getUniqueTags,
  getUniqueCategories,
  getAvailableArticleFacets,
  extractMarkdownHeadings,
  buildCompatibilityDisplay,
  filterTocHeadings,
};

export async function getPublishedArticles(options?: {
  excludeDraftsAlways?: boolean;
}): Promise<ArticleEntry[]> {
  const articles = await getCollection('articles');
  const shouldExcludeNonPublic = options?.excludeDraftsAlways ?? import.meta.env.PROD;

  return filterAndSortArticles(articles, {
    excludeNonPublic: shouldExcludeNonPublic,
  });
}

export async function getAllSeries(): Promise<SeriesEntry[]> {
  const series = await getCollection('series');
  return series.sort((a, b) => a.data.order - b.data.order);
}

export async function getSeriesById(id: string): Promise<SeriesEntry | undefined> {
  const allSeries = await getAllSeries();
  return allSeries.find((item) => item.id === id);
}

export async function getAllProjects(options?: {
  excludeDraftsAlways?: boolean;
}): Promise<ProjectEntry[]> {
  const projects = await getCollection('projects');
  const shouldExcludeDrafts = options?.excludeDraftsAlways ?? import.meta.env.PROD;

  return projects
    .filter((entry) => (shouldExcludeDrafts ? !entry.data.draft : true))
    .sort((a, b) => {
      if (a.data.featured !== b.data.featured) {
        return a.data.featured ? -1 : 1;
      }
      return a.data.order - b.data.order;
    });
}
