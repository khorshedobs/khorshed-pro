import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '@/config/site';
import { getPublishedArticles } from '@/lib/content';

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles({ excludeDraftsAlways: true });

  return rss({
    title: siteConfig.siteTitle,
    description: siteConfig.defaultDescription,
    site: context.site ?? siteConfig.siteUrl,
    trailingSlash: true,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.id}/`,
      categories: [article.data.category, ...article.data.tags],
      author: article.data.author,
    })),
    customData: `<language>${siteConfig.language}</language>`,
  });
}
