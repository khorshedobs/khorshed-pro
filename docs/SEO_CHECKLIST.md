# Technical SEO & Discoverability Checklist — khorshed.pro

Pre-publish and post-build SEO checklist enforced across layouts, validation scripts, and automated tests.

---

## 1. Per-Article Metadata & On-Page Structure

- [ ] **Title tag:** Specific, descriptive, and readable in search results (recommended `<= 85` characters).
- [ ] **Meta description:** Actionable summary within 60–175 characters (`scripts/validate-articles.mjs` warns outside this range).
- [ ] **Canonical URL:** Exact trailing-slash route `https://khorshed.pro/articles/<slug>/` emitted via `src/components/layout/SEO.astro`.
- [ ] **Heading hierarchy:** One `<h1>` article title followed by descriptive `<h2>` / `<h3>` headings (indexed into `/search-index.json` and sticky TOC).
- [ ] **Structured data (`JSON-LD`):** `BlogPosting` and `BreadcrumbList` embedded on every published article page.
- [ ] **Internal links:** Validated against published slugs so broken or draft links never ship.

---

## 2. Automatic Open Graph & Social Card Images

Run `npm run og:generate` (executed automatically by `npm run build` and `npm run check`):

- [ ] Renders `1200x630` PNG cards via `sharp` (`public/og/default.png` and `public/og/articles/<slug>.png`).
- [ ] Removes any stale or non-public draft PNGs from `public/og/articles/`.
- [ ] `ArticleLayout.astro` + `SEO.astro` emit:
  - `og:image` -> `https://khorshed.pro/og/articles/<slug>.png`
  - `og:image:width` -> `1200`
  - `og:image:height` -> `630`
  - `og:image:alt`
  - `twitter:card` -> `summary_large_image`

---

## 3. Site-Wide Discovery & Draft Isolation

- [ ] **`/search-index.json`** (`src/pages/search-index.json.ts`) indexes published articles (`title`, `description`, `tags`, `phpVersion`, `category`, `sectionCategory`, `difficulty`, `headings`, `readingTime`) and drives instant search & filtering on `/articles/`.
- [ ] **`/rss.xml`** and **`/sitemap-0.xml`** only list published articles.
- [ ] **Draft safety:** Non-public articles (`draft: true` or `status !== "published"`) have zero HTML routes in `dist/`, zero entries in `/rss.xml`, `/sitemap-0.xml`, or `/search-index.json`, and zero PNG files in `dist/og/articles/`.
