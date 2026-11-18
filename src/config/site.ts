export interface NavItem {
  label: string;
  href: string;
}

export interface SocialProfile {
  key: 'github' | 'linkedin' | 'x' | 'email';
  label: string;
  href: string;
  handle?: string;
}

export interface SocialConfig {
  /** Example: 'https://github.com/your-username' */
  github?: string;
  githubHandle?: string;
  /** Example: 'https://www.linkedin.com/in/your-username/' */
  linkedin?: string;
  linkedinHandle?: string;
  /** Example: 'https://x.com/your-handle' */
  x?: string;
  xHandle?: string;
  /** Example: 'hello@khorshed.pro' */
  email?: string;
}

export interface ExpertiseCategory {
  title: string;
  summary: string;
  items: string[];
}

export const siteConfig = {
  siteUrl: 'https://khorshed.pro',
  siteName: 'Khorshed Alam',
  siteTitle: 'Khorshed Alam — Software Engineer & Technical Writer',
  monogram: 'KA',
  eyebrow: 'Software Engineer • Technical Writer',
  heroHeadlineLine1: 'Building software.',
  heroHeadlineLine2: 'Sharing knowledge.',
  heroDescription:
    'Exploring modern PHP, Laravel, WordPress, and the engineering decisions behind reliable software.',
  defaultDescription:
    'Personal website and technical publication of Khorshed Alam. Writing on modern PHP (8.0–8.6), Laravel, WordPress engineering, APIs, and maintainable backend architecture.',
  locale: 'en_US',
  language: 'en',
  author: {
    name: 'Khorshed Alam',
    role: 'Software Engineer & Technical Writer',
    bioShort:
      'I build production PHP, Laravel, WordPress, and TypeScript systems—focusing on clear domain boundaries, resilient APIs, and technical writing that turns language features into practical habits.',
  },
  flagshipSeries: {
    slug: 'modern-php-mastery',
    title: 'Modern PHP Mastery: 8.0 → 8.6',
    subtitle: 'From Modern Syntax to Advanced Engineering',
    shortDescription:
      'A practical exploration of the language features, type-system refinements, and architectural patterns shaping modern PHP.',
  },
  /**
   * Populate your real public profile URLs and email address below.
   * Any undefined field is automatically omitted from rendered pages and JSON-LD.
   */
  social: {
    github: 'https://github.com/khorshedobs',
    githubHandle: '@khorshedobs',
    linkedin: undefined,
    linkedinHandle: undefined,
    x: undefined,
    xHandle: undefined,
    email: undefined,
  } as SocialConfig,
  navigation: [
    { label: 'Articles', href: '/articles/' },
    { label: 'Series', href: '/series/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'About', href: '/about/' },
    { label: 'Speaking', href: '/speaking/' },
    { label: 'Contact', href: '/contact/' },
  ] satisfies NavItem[],
  footerResources: [
    { label: 'Modern PHP Mastery', href: '/series/modern-php-mastery/' },
    { label: 'Speaking', href: '/speaking/' },
    { label: 'RSS Feed', href: '/rss.xml' },
    { label: 'Sitemap', href: '/sitemap-index.xml' },
  ] satisfies NavItem[],
  seo: {
    titleTemplate: '%s — Khorshed Alam',
    defaultImageAlt: 'Khorshed Alam — Software Engineer & Technical Writer',
    twitterCard: 'summary' as const,
  },
  expertiseCategories: [
    {
      title: 'PHP & Laravel',
      summary:
        'Modern typed PHP (8.0+), domain modeling, service-layer architecture, automated testing, and maintainable Laravel backends.',
      items: ['PHP 8.0–8.5', 'Laravel', 'Pest & PHPUnit', 'Static Analysis', 'Composer Packages'],
    },
    {
      title: 'WordPress & WooCommerce',
      summary:
        'Extensible plugin architecture, custom blocks, performance-conscious data modeling, and ecosystem coding standards.',
      items: ['WordPress Core Patterns', 'WooCommerce Extensibility', 'REST & Hooks', 'WP-CLI', 'Coding Standards'],
    },
    {
      title: 'JavaScript & TypeScript',
      summary:
        'Strict TypeScript tooling, accessible progressive enhancement, and predictable component boundaries.',
      items: ['TypeScript (Strict)', 'Modern ES Modules', 'Astro', 'Tailwind CSS', 'Web Standards'],
    },
    {
      title: 'React & Node.js',
      summary:
        'Targeted interactive interfaces when client state warrants it, paired with build tooling and CLI automation.',
      items: ['React', 'Node.js Tooling', 'Build Pipelines', 'Package Workflows'],
    },
    {
      title: 'APIs & Integrations',
      summary:
        'Resilient HTTP contracts, webhook verification, idempotency, rate-limiting strategies, and schema validation.',
      items: ['REST APIs', 'Webhook Systems', 'Idempotency', 'OpenAPI', 'JSON Schemas'],
    },
    {
      title: 'Databases & Infrastructure',
      summary:
        'Relational schema design, indexing fundamentals, caching strategy, static edge delivery, and Nginx hosting.',
      items: ['MySQL & PostgreSQL', 'Query Optimization', 'Nginx', 'CloudPanel', 'Git Workflows'],
    },
  ] satisfies ExpertiseCategory[],
} as const;

export function getConfiguredSocials(): SocialProfile[] {
  const profiles: SocialProfile[] = [];
  const { social } = siteConfig;

  if (social.github) {
    profiles.push({
      key: 'github',
      label: 'GitHub',
      href: social.github,
      handle: social.githubHandle,
    });
  }

  if (social.linkedin) {
    profiles.push({
      key: 'linkedin',
      label: 'LinkedIn',
      href: social.linkedin,
      handle: social.linkedinHandle,
    });
  }

  if (social.x) {
    profiles.push({
      key: 'x',
      label: 'X',
      href: social.x,
      handle: social.xHandle,
    });
  }

  if (social.email) {
    profiles.push({
      key: 'email',
      label: 'Email',
      href: `mailto:${social.email}`,
      handle: social.email,
    });
  }

  return profiles;
}

export function getSameAsUrls(): string[] {
  const { social } = siteConfig;
  return [social.github, social.linkedin, social.x].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
}
