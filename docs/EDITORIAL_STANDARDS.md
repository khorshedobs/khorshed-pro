# Editorial Standards — khorshed.pro

Standards governing technical publications on **khorshed.pro**, especially the flagship **Modern PHP Mastery: 8.0 -> 8.6** series.

---

## 1. Core Voice & Engineering Principles

- **Precision over hype:** Explain language features with exact syntax rules, version boundaries, edge cases, and failure modes.
- **No fabricated claims:** Never invent production metrics, benchmark speedups, client anecdotes, or undocumented runtime behaviors.
- **Honest version discipline:** Clearly separate shipped versions (`PHP 8.0`–`8.5`) from unreleased versions (`PHP 8.6`, GA scheduled November 19, 2026). Pre-release articles must keep `draft: true`, `status` set to a non-public stage (`drafting` / `technical-review`), and `technicalVerificationStatus: "awaiting-php-release"`.

---

## 2. Required Article Structure

Every technical article authored in `src/content/articles/` (via `npm run article:new` or `_template.mdx`) should follow this structure:

1. **Frontmatter metadata:** Complete title, 60–175 character meta description, `publishedAt`, `draft` flag, `status`, `category`, `sectionCategory`, `tags`, `series`, `seriesOrder`, `phpVersion`, `minimumPhpVersion`, `testedPhpVersions`, `technicalVerificationStatus`, `difficulty`, `researchReferences`, and `relatedArticles`.
2. **Compatibility notice:** Use `<Callout type="compatibility">` to identify the minimum PHP version, required extensions, and verified runtime versions.
3. **Problem & Before/After comparison:** Show what pre-feature PHP code required alongside the modern pattern using `<CodeComparison>`.
4. **Runnable example walkthrough:** Link prose explanations to verifiable PHP source files under `examples/php-<major>-<minor>/<topic>/`.
5. **Edge cases & when not to use:** Document incompatibilities (for instance, `readonly` restrictions on Property Hooks or arrow-function precedence with `|>`).
6. **Official references:** Link directly to PHP Manual documentation and accepted RFCs.

---

## 3. Editorial Workflow Statuses

`src/content.config.ts` and `scripts/validate-articles.mjs` enforce these lifecycle states:

| Status | Public in Build? | Meaning |
| --- | --- | --- |
| `idea` | No (`draft: true`) | Logged in `src/data/editorial-roadmap.json`. |
| `researching` | No (`draft: true`) | Collecting RFCs, PHP manual references, and edge cases. |
| `drafting` | No (`draft: true`) | Writing prose and drafting companion code examples. |
| `draft` | No (`draft: true`) | Generic unready draft excluded from static routes. |
| `technical-review` | No (`draft: true`) | Verifying runtime execution, syntax, and assertions. |
| `editorial-review` | No (`draft: true`) | Checking readability, SEO metadata, links, and formatting. |
| `ready` | No (`draft: true`) | Approved for scheduled release; flip to `published` + `draft: false` at launch. |
| `published` | **Yes** (`draft: false`) | Included in site HTML, `/rss.xml`, `/sitemap-0.xml`, `/search-index.json`, and `public/og/articles/`. |

---

## 4. Forbidden Pre-Publication Patterns

`npm run validate:articles` rejects published articles that contain:

- Placeholder markers (`TODO`, `FIXME`, `SAMPLE CONTENT`, `Replace this text`, `Placeholder biography`)
- `isSampleContent: true`
- `technicalVerificationStatus: "awaiting-php-release"`
- Contradictory flags (`status: "published"` combined with `draft: true`, or non-public `status` with `draft: false`)
- Broken `examplePath`, `testsPath`, `relatedArticles`, or internal `/articles/<slug>/` links
- Missing `public/og/articles/<slug>.png` asset
