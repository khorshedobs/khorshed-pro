import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const versionPattern = /^\d+\.\d+(\+)?$/;
const strictVersionPattern = /^\d+\.\d+$/;
const testedVersionPattern = /^\d+\.\d+(\.\d+)?(-?(alpha|beta|rc)\d*)?$/i;

const articles = defineCollection({
  loader: glob({
    pattern: '**/!(_)*.mdx',
    base: './src/content/articles',
  }),
  schema: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    status: z
      .enum([
        'idea',
        'researching',
        'drafting',
        'draft',
        'technical-review',
        'editorial-review',
        'ready',
        'published',
      ])
      .default('published'),
    featured: z.boolean().default(false),
    category: z.string().min(1),
    sectionCategory: z
      .enum([
        'Language Features',
        'Object-Oriented Design',
        'Functional Programming',
        'Performance',
        'Architecture',
        'Security',
        'Compatibility',
      ])
      .default('Language Features'),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    phpVersion: z.string().regex(versionPattern).optional(),
    minimumPhpVersion: z.string().regex(strictVersionPattern).optional(),
    testedPhpVersions: z.array(z.string().regex(testedVersionPattern)).default([]),
    technicalVerificationStatus: z
      .enum(['unverified', 'syntax-checked', 'runtime-tested', 'awaiting-php-release'])
      .optional(),
    deprecatedIn: z.string().regex(strictVersionPattern).optional(),
    removedIn: z.string().regex(strictVersionPattern).optional(),
    requiredExtensions: z.array(z.string()).default([]),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    coverImage: z.string().optional(),
    author: z.string().default('Khorshed Alam'),
    canonicalURL: z.url().optional(),
    repositoryURL: z.url().optional(),
    examplePath: z.string().optional(),
    testsPath: z.string().optional(),
    researchReferences: z
      .array(
        z.object({
          title: z.string().min(1),
          url: z.url(),
          status: z
            .enum([
              'Proposed RFC',
              'Accepted RFC',
              'Implemented',
              'Released Documentation',
              'Deprecated',
              'Removed',
            ])
            .optional(),
        }),
      )
      .default([]),
    relatedArticles: z.array(z.string()).default([]),
    isSampleContent: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/series',
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    phpVersionRange: z.string().optional(),
    status: z.enum(['Active', 'Planned', 'Completed']).default('Active'),
    featured: z.boolean().default(false),
    order: z.number().int().default(1),
    topics: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/!(_)*.mdx',
    base: './src/content/projects',
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string(),
    projectType: z
      .enum([
        'Open-Source Library',
        'Commercial Software',
        'WordPress Plugin',
        'Laravel Application',
        'SaaS Project',
        'Technical Experiment',
      ])
      .default('Technical Experiment'),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    status: z
      .enum(['Active', 'Completed', 'In Development', 'Blueprint', 'Sample Placeholder'])
      .default('Blueprint'),
    isSample: z.boolean().default(true),
    year: z.number().int().optional(),
    githubUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    coverImage: z.string().optional(),
    order: z.number().int().default(1),
    problem: z.string(),
    solution: z.string(),
    keyFeatures: z.array(z.string()),
    technicalDecisions: z.array(z.string()),
  }),
});

export const collections = {
  articles,
  series,
  projects,
};
