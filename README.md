# khorshed.pro — Personal Developer Website

Personal portfolio, technical publication, and developer knowledge hub for **Khorshed Alam** ([https://khorshed.pro](https://khorshed.pro)).

This project provides a statically generated (SSG), accessible, and extensible foundation centered around technical writing—anchored by the flagship series **Modern PHP Mastery: 8.0 → 8.6**—alongside project case studies, educational series, and speaking resources.

---

## 1. Project Overview

- **Website:** `https://khorshed.pro`
- **Owner:** Khorshed Alam
- **Architecture:** 100% Static Site Generation (SSG) producing a self-contained `dist/` directory suitable for Nginx / CloudPanel static hosting without a Node.js runtime process in production.
- **Core Capabilities:**
  - Editorial typography with light, dark, and OS-preference themes (zero FOUC)
  - MDX technical publishing powered by Astro Content Collections
  - Dual-theme Shiki syntax highlighting (PHP, JS, TS, Bash, JSON, HTML, CSS, SQL, YAML) with copy-to-clipboard buttons
  - Structured multi-part series system grouping articles by PHP version and explicit sequence order
  - SEO metadata, Open Graph & Twitter/X tags, JSON-LD (`Person`, `WebSite`, `BlogPosting`, `BreadcrumbList`), XML sitemap, `robots.txt`, and RSS feed (`/rss.xml`)

---

## 2. Technology Stack

- **Framework:** Astro (SSG)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + CSS custom property design tokens
- **Fonts:** Self-hosted `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`
- **Content:** MDX (`@astrojs/mdx`) + Astro Content Collections (`src/content.config.ts`)
- **Syntax Highlighting:** Shiki (`github-light` & `github-dark` dual themes)
- **Icons:** `@lucide/astro`
- **Syndication & SEO:** `@astrojs/rss`, `@astrojs/sitemap`
- **Production Hosting:** Nginx managed via CloudPanel (Static HTML Site)

---

## 3. Requirements

- **Node.js:** v20.19+ or v22+ (tested on Node v26.8.2)
- **npm:** v10+
- **Git**

---

## 4. Local Installation

```bash
git clone <your-repository-url>
cd khorshedpro
npm install
```

---

## 5. Development Commands

Start the local development server:

```bash
npm run dev
```

Run Astro type, article metadata, and template diagnostics:

```bash
npm run check
```

Run unit tests, PHP example validation, and post-build output verification:

```bash
npm test
npm run validate:examples
npm run build && npm run test:build
```

Run article scaffolding, Open Graph generation, and social distribution kits:

```bash
npm run article:new
npm run og:generate
npm run social:generate -- --slug <slug>
```

For full Phase 3–4 authoring, editorial workflow, SEO, and distribution documentation, see:

- [docs/ARTICLE_AUTHORING.md](docs/ARTICLE_AUTHORING.md)
- [docs/EXAMPLE_VALIDATION.md](docs/EXAMPLE_VALIDATION.md)
- [docs/EDITORIAL_ROADMAP.md](docs/EDITORIAL_ROADMAP.md)
- [docs/EDITORIAL_STANDARDS.md](docs/EDITORIAL_STANDARDS.md)
- [docs/PHP_RESEARCH_GUIDELINES.md](docs/PHP_RESEARCH_GUIDELINES.md)
- [docs/ARTICLE_PUBLICATION_WORKFLOW.md](docs/ARTICLE_PUBLICATION_WORKFLOW.md)
- [docs/SOCIAL_DISTRIBUTION.md](docs/SOCIAL_DISTRIBUTION.md)
- [docs/SEO_CHECKLIST.md](docs/SEO_CHECKLIST.md)

Sync Astro Content Collection types manually if needed:

```bash
npx astro sync
```

---

## 6. Build Commands

Generate the production static output in `dist/`:

```bash
npm run build
```

Preview the production `dist/` output locally:

```bash
npm run preview
```

---

## 7. Folder Structure

```text
.
├── astro.config.mjs           # Astro, MDX, Sitemap, Tailwind, and Shiki configuration
├── package.json
├── tsconfig.json              # Strict TypeScript config with @/* alias
├── public/
│   ├── favicon.svg            # KA monogram SVG icon
│   ├── robots.txt             # Crawler rules and sitemap pointer
│   ├── icons/                 # Static icon assets
│   └── images/                # Static image assets (project screenshots, covers)
└── src/
    ├── content.config.ts      # Content Collection schemas (articles, series, projects)
    ├── config/
    │   ├── site.ts            # Global site URL, author, navigation, social links, expertise
    │   └── speaking.ts        # Speaking appearances and available talk proposals
    ├── content/
    │   ├── articles/          # MDX technical articles
    │   ├── series/            # Structured JSON series metadata
    │   └── projects/          # MDX project case studies
    ├── components/
    │   ├── article/           # ArticleCard, ArticleHeader, TableOfContents, CodeBlock, etc.
    │   ├── layout/            # Header, Footer, MobileNav, ThemeToggle, Container, SEO
    │   ├── projects/          # ProjectCard
    │   ├── series/            # SeriesCard
    │   └── ui/                # Button, Badge, Breadcrumbs, SectionHeading, EmptyState
    ├── layouts/
    │   ├── BaseLayout.astro   # HTML shell, anti-FOUC theme script, code-block copy enhancer
    │   └── ArticleLayout.astro# Editorial article layout with TOC and series navigation
    ├── lib/
    │   ├── content.ts         # Collection queries, sorting, draft filtering, version grouping
    │   ├── date.ts            # UTC date formatting helpers
    │   └── reading-time.ts    # Word-count and reading-time estimator
    ├── pages/
    │   ├── index.astro        # Homepage (/)
    │   ├── about/             # About page (/about/)
    │   ├── articles/          # Articles index (/articles/) & detail (/articles/[slug]/)
    │   ├── series/            # Series index (/series/) & landing pages (/series/[slug]/)
    │   ├── projects/          # Projects index (/projects/) & detail (/projects/[slug]/)
    │   ├── speaking/          # Speaking page (/speaking/)
    │   ├── contact/           # Contact page (/contact/)
    │   ├── 404.astro          # Custom 404 page (/404.html)
    │   └── rss.xml.ts         # RSS 2.0 feed (/rss.xml)
    └── styles/
        └── global.css         # Tailwind import, self-hosted fonts, theme tokens, prose styles
```

---

## 8. How to Create an Article

Create a new `.mdx` file under `src/content/articles/` (for example `src/content/articles/my-new-article.mdx`):

```mdx
---
title: "Your Article Title"
description: "Concise technical summary shown on cards and in meta descriptions."
publishedAt: 2026-04-01
updatedAt: 2026-04-05
draft: false
featured: false
category: "PHP"
tags:
  - "php"
  - "architecture"
series: "modern-php-mastery"
seriesOrder: 4
phpVersion: "8.4"
difficulty: "Intermediate"
author: "Khorshed Alam"
repositoryURL: "https://github.com/your-username/example-repo"
relatedArticles:
  - "php-84-property-hooks"
isSampleContent: false
---

Write your article content in standard Markdown / MDX here.

```php title="src/Example.php"
<?php

declare(strict_types=1);
```
```

- Set `draft: true` while drafting; drafts are automatically excluded from production builds (`npm run build`) and from `/rss.xml`.
- Adding `title="..."` or `filename="..."` after the fenced language name displays a filename label in the code block header.

---

## 9. How to Create a Series

1. Create a JSON file in `src/content/series/` (for example `src/content/series/laravel-deep-dive.json`):

```json
{
  "title": "Laravel Deep Dive",
  "subtitle": "Application Architecture Beyond Framework Defaults",
  "description": "Structured series description.",
  "phpVersionRange": "8.3 → 8.5",
  "status": "Active",
  "featured": false,
  "order": 2,
  "topics": ["Service Architecture", "Queues", "Testing"]
}
```

2. The series route `/series/<filename-without-ext>/` is generated automatically.
3. Reference the series ID in any article's frontmatter using `series: "laravel-deep-dive"` and `seriesOrder: 1`.

---

## 10. How to Add a Project

Create a new `.mdx` file in `src/content/projects/` matching the schema in `src/content.config.ts`:

```mdx
---
title: "Project Name"
summary: "One-line card summary."
description: "Longer overview shown on the project detail header."
projectType: "Open-Source Library"
technologies:
  - "PHP"
  - "Laravel"
featured: true
draft: false
status: "Active"
isSample: false
year: 2026
githubUrl: "https://github.com/your-username/project"
demoUrl: "https://example.com"
order: 1
problem: "What engineering problem this project solved."
solution: "How the system solved it."
keyFeatures:
  - "Feature one"
  - "Feature two"
technicalDecisions:
  - "Why key trade-offs were chosen."
---

Additional architectural notes and code examples go here.
```

---

## 11. How to Modify Personal Profile Information

- Edit global profile details (site title, eyebrow, hero headline, short bio, expertise categories, and navigation) in `src/config/site.ts`.
- Edit the full biography narrative and principles in `src/pages/about/index.astro`.
- Edit speaking appearances and talk proposals in `src/config/speaking.ts`.

---

## 12. How to Configure Social Accounts

All social URLs and direct contact details live in one central object inside `src/config/site.ts`:

```ts
social: {
  github: 'https://github.com/your-username',
  githubHandle: '@your-username',
  linkedin: 'https://www.linkedin.com/in/your-username/',
  linkedinHandle: 'your-username',
  x: 'https://x.com/your-handle',
  xHandle: '@your-handle',
  email: 'hello@khorshed.pro',
}
```

Any field left as `undefined` is omitted automatically from the homepage, footer, contact page, and JSON-LD metadata.

---

## 13. How to Customize the Theme

Design tokens are defined as CSS custom properties in `src/styles/global.css` under `:root` (light mode) and `html.dark` (dark mode):

- `--bg-primary`, `--bg-surface`, `--bg-elevated`
- `--text-primary`, `--text-secondary`
- `--accent`, `--accent-hover`, `--accent-subtle`
- `--border-color`

Syntax highlighting themes are configured in `astro.config.mjs` under `markdown.shikiConfig.themes` (`github-light` / `github-dark`).

---

## 14. How to Deploy on CloudPanel

This website builds to pure static HTML, CSS, JavaScript, and XML files in `dist/`. No Node.js process is required on the production server.

1. **Create a Static HTML Site in CloudPanel**
   - Log in to CloudPanel and click **+ Add Site** → **Create a Static HTML Site**.
   - Enter `khorshed.pro` as the domain name and complete site creation.
2. **Configure `khorshed.pro`**
   - Note the site's configured document root inside CloudPanel (the directory assigned to your static site).
   - Ensure Nginx is configured with clean directory index resolution (`index index.html;`) and custom 404 handling (`error_page 404 /404.html;`).
3. **Configure DNS**
   - Point your domain's `A` (and `AAAA` if using IPv6) records for `khorshed.pro` and `www.khorshed.pro` to your VPS public IP address.
   - Configure a `www` to apex (`khorshed.pro`) redirect or vice versa inside CloudPanel's vhost/domain settings so canonical URLs stay consistent.
4. **Enable SSL**
   - In CloudPanel under your site's **SSL/TLS** tab, issue and install a free Let's Encrypt certificate for `khorshed.pro` once DNS has propagated.
5. **Build the Astro Project**
   - Locally (or on a build machine), run:
     ```bash
     npm install
     npm run build
     ```
   - Verify that `dist/` contains `index.html`, `404.html`, `rss.xml`, `sitemap-index.xml`, `robots.txt`, and nested route folders (`articles/`, `series/`, `projects/`, `about/`, `speaking/`, `contact/`).
6. **Upload the Contents of `dist/`**
   - Sync or upload **the contents inside `dist/`** (not the `dist` directory wrapper itself) to the configured CloudPanel document root using `rsync`, SFTP, or SCP.
   - Example with `rsync` (replace placeholders with your SSH host and configured document root):
     ```bash
     rsync -avz --delete dist/ <ssh-user>@<server-host>:<configured-document-root>/
     ```
7. **Confirm Nested Article URLs Work**
   - Open `https://khorshed.pro/articles/php-84-property-hooks/` and `https://khorshed.pro/series/modern-php-mastery/` in a browser and verify HTTP `200` responses without redirect loops, plus HTTP `404` for an unknown path.
8. **Verify Static Assets and Caching Behavior**
   - Confirm CSS/JS/font bundles under `/_astro/` return `200` and include long-lived `Cache-Control` headers in your Nginx static site config, while HTML pages, `rss.xml`, and `sitemap-index.xml` revalidate cleanly on new deployments.

---

## 15. Future Improvement Roadmap

- **Phase 2 (Content & Discovery):** Tag/category filter pages, client-side lightweight search (e.g., Pagefind on static `dist/`), pagination for `/articles/`, and custom Open Graph image generation.
- **Phase 3 (Interactive Engineering Features):** Interactive code annotations, expandable comparison blocks, newsletter/contact form integration via an external form provider, and automated CI/CD deployment to CloudPanel via GitHub Actions.
