import type { APIRoute } from 'astro';
import {
  extractMarkdownHeadings,
  getPublishedArticles,
} from '@/lib/content';
import { getReadingTime } from '@/lib/reading-time';

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles({ excludeDraftsAlways: true });

  const items = articles.map((article) => ({
    id: article.id,
    slug: article.id,
    url: `/articles/${article.id}/`,
    title: article.data.title,
    description: article.data.description,
    category: article.data.category,
    sectionCategory: article.data.sectionCategory,
    phpVersion: article.data.phpVersion ?? null,
    difficulty: article.data.difficulty ?? null,
    tags: article.data.tags,
    headings: extractMarkdownHeadings(article.body),
    publishedAt: article.data.publishedAt.toISOString(),
    readingTime: getReadingTime(article.body).label,
  }));

  return new Response(JSON.stringify({ count: items.length, items }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
