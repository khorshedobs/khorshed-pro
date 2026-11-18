# Article Publication Workflow — khorshed.pro

End-to-end publishing workflow from roadmap selection to verified deployment on **https://khorshed.pro**.

---

## Step 1 — Pick Topic & Scaffold Draft

1. Select the next topic from `docs/EDITORIAL_ROADMAP.md` and `src/data/editorial-roadmap.json`.
2. Scaffold a new MDX article draft (always initialized as `draft: true`, `status: "drafting"`):

```bash
npm run article:new -- --slug php-84-asymmetric-visibility --title "PHP 8.4 Asymmetric Visibility" --php 8.4 --section "Object-Oriented Design" --order 19
```

3. Use `--add-to-roadmap` only if creating an article outside the existing 30-article series plan. `npm run article:new` refuses to overwrite existing files.

---

## Step 2 — Build & Verify Companion Examples

1. Write minimal, idiomatic PHP examples under `examples/php-<major>-<minor>/<topic>/src/` and assertions under `tests/`.
2. Syntax-check and execute against the target PHP runtime (`npm run validate:examples`, CI matrix, or server PHP binaries).
3. Update article frontmatter `testedPhpVersions` and set `technicalVerificationStatus: "runtime-tested"`.

---

## Step 3 — Draft, Compare & Refine Prose

1. Author the article using `<CodeComparison>`, `<Callout>`, headings (`h2`/`h3` for table of contents and search indexing), and primary `researchReferences`.
2. Advance frontmatter `status` through `technical-review` -> `editorial-review` -> `ready` while keeping `draft: true`.

---

## Step 4 — Generate Social Preview & Distribution Package

1. Generate the `1200x630` Open Graph PNG and run full checks once ready to publish (`draft: false`, `status: "published"`):

```bash
npm run og:generate
npm run social:generate -- --slug <slug>
```

2. Review and tailor `content/social/<slug>/linkedin.md`, `facebook.md`, and `x-thread.md` (preserving UTM query parameters from `metadata.json` and <= 280 characters per X post).

---

## Step 5 — Validate, Build, Test & Deploy

Run the full local gate before pushing:

```bash
npm run check
npm test
npm run build
npm run test:build
```

Then push `main` to GitHub (`khorshedobs/khorshed-pro`) so CI (`site-checks` + `php-examples`) verifies everything, sync `dist/` to `/home/khorshed/htdocs/khorshed.pro/` via CloudPanel deployment, and spot-check live URLs, `/search-index.json`, and `/og/articles/<slug>.png`.
