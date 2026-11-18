# Article Authoring Guide (`khorshed.pro`)

This guide documents how technical articles are authored, structured, validated, and published on **khorshed.pro**.

---

## 1. Creating an Article

1. Copy the starter template [src/content/articles/_template.mdx](file:///Volumes/RobelExt/Web/khorshedpro/src/content/articles/_template.mdx) to a new slug file in `src/content/articles/<slug>.mdx`.
   - Files starting with `_` (like `_template.mdx`) are ignored by Astro Content Collections and validation scripts.
2. Keep `draft: true` and `status: "draft"` until technical examples and editorial review are complete.
3. Set the actual `publishedAt` date when publishing rather than backdating content artificially.

---

## 2. Frontmatter Reference

| Field | Required | Description |
| :--- | :--- | :--- |
| `title` | Yes | Full article title. Used in headings, metadata, and JSON-LD. |
| `description` | Yes | Concise 1–2 sentence summary for cards and SEO meta tags. |
| `publishedAt` | Yes | Publication date (`YYYY-MM-DD`). |
| `updatedAt` | No | Last meaningful revision date (`YYYY-MM-DD`). |
| `draft` | Yes | Boolean (`true` excludes the entry in production). |
| `status` | Yes | `draft` \| `technical-review` \| `ready` \| `published`. Only `draft: false` + `status: "published"` is emitted publicly. |
| `featured` | No | Highlights the entry where featured curation applies. |
| `category` | Yes | Primary topic (e.g. `PHP`, `Laravel`, `WordPress`, `TypeScript`). |
| `tags` | No | Lowercase topic tags array. |
| `series` | No | Series ID matching `src/content/series/<id>.json`. |
| `seriesOrder` | No | Positive integer ordering within the series (`1`, `2`, `3`, ...). Must be unique among published articles in the same series. |
| `phpVersion` | No | Version that introduced the feature (e.g. `"8.4"`). |
| `minimumPhpVersion` | No | Strict minimum runtime requirement (e.g. `"8.4"`). |
| `testedPhpVersions` | No | Array of PHP versions where examples were actually run (e.g. `["8.4.27", "8.5.12"]`). Never infer or claim unexecuted versions. |
| `deprecatedIn` / `removedIn` | No | Optional deprecation or removal version (`"8.4"`). |
| `requiredExtensions` | No | Required PHP extensions (empty array renders `None`). |
| `difficulty` | No | `Beginner` \| `Intermediate` \| `Advanced`. |
| `author` | Yes | Defaults to `"Khorshed Alam"`. |
| `canonicalURL` | No | Override canonical URL only when cross-posting. |
| `repositoryURL` | No | Public GitHub repository URL (omit unless an actual repository is live). |
| `examplePath` | No | Relative path to companion runnable example (e.g. `"examples/php-8-4/property-hooks/"`). |
| `testsPath` | No | Relative path to example test file (e.g. `"examples/php-8-4/property-hooks/tests/PropertyHooksTest.php"`). |
| `relatedArticles` | No | Slugs of published related articles. Never reference drafts. |

---

## 3. Draft & Review Workflow

Public visibility requires **both** `draft: false` and `status: "published"` (`isArticlePublic()` in `src/lib/article-logic.ts`):

- `draft` — Initial writing in progress.
- `technical-review` — Draft complete; awaiting PHP runtime testing and edge-case verification.
- `ready` — Code verified and edited; ready for release once `publishedAt` is confirmed.
- `published` — Live public article included in static routes, RSS, sitemap, series navigation, and related articles.

---

## 4. Advanced Code Blocks

Fenced code blocks use dual-theme Shiki highlighting (`github-light` / `github-dark`) enhanced by `src/lib/shiki-transformer.ts` and `BaseLayout.astro`.

Supported fence metadata options:

````markdown
```php title="src/Example.php" php="8.4" showLineNumbers highlight={2,4-6} caption="Short explanation below the code block."
<?php
// ...
```
````

- `title="..."` or `filename="..."`: Displays a file or example label in the code header.
- `php="..."` or `version="..."`: Displays a compact version badge (e.g., `PHP 8.4`).
- `showLineNumbers` or `lineNumbers`: Enables CSS-rendered line numbers (automatically excluded when clicking **Copy**).
- `highlight={2,4-6}` or `{2,4-6}`: Highlights lines `2`, `4`, `5`, and `6`.
- `caption="..."`: Renders an explanatory caption strip under the code panel.

---

## 5. Diff Annotations & Inline Highlights

Inside any fenced code block (or `<CodeBlock>` / `<CodeComparison>` panel), append a trailing comment directive on a line:

- `// [!code ++]` (or `# [!code ++]` for Bash/YAML) — marks the line as **added** (`+` badge and accessible green highlight).
- `// [!code --]` (or `# [!code --]`) — marks the line as **removed** (`-` badge and accessible red highlight).
- `// [!code highlight]` (or `# [!code highlight]`) — emphasizes that specific line.

The transformer strips `[!code ...]` comments from the rendered DOM so clicking **Copy** always produces clean, runnable code.

---

## 6. Before/After Code Comparisons (`<CodeComparison>`)

Import `CodeComparison` inside your `.mdx` file:

```mdx
import CodeComparison from '@/components/article/CodeComparison.astro';

<CodeComparison
  title="Traditional Accessors vs. Property Hooks"
  description="Compare private properties paired with getters/setters against inline hooks."
  summary="Property hooks preserve direct property syntax without sacrificing validation."
  before={{
    label: "Before",
    version: "PHP 8.3",
    language: "php",
    file: "src/UserBefore.php",
    showLineNumbers: true,
    code: `...`,
  }}
  after={{
    label: "After",
    version: "PHP 8.4",
    language: "php",
    file: "src/UserProfile.php",
    showLineNumbers: true,
    highlightLines: [4, 5],
    code: `...`,
  }}
/>
```

`CodeComparison` renders side-by-side on desktop (`lg:grid-cols-2`), stacks vertically on mobile, provides separate Copy buttons, supports arbitrary Shiki languages, and scrolls long lines inside each panel independently.

---

## 7. Technical Callouts (`<Callout>`)

Import `Callout` inside your `.mdx` file:

```mdx
import Callout from '@/components/article/Callout.astro';

<Callout type="compatibility" title="PHP 8.4 Language Feature">
  Requires PHP 8.4 or later.
</Callout>
```

Available `type` variants:

- `info`
- `tip`
- `warning`
- `important`
- `compatibility`
- `performance`
- `security`
- `best-practice`

---

## 8. PHP Version Requirements & Compatibility Component

When any of `phpVersion`, `minimumPhpVersion`, `testedPhpVersions`, `requiredExtensions`, `deprecatedIn`, or `removedIn` is present in frontmatter, `ArticleLayout.astro` automatically renders `<PhpCompatibility>` directly under the article header.

Keep these rules strict:

1. Never populate `testedPhpVersions` unless you actually ran the example suite on those exact PHP versions.
2. For unreleased or RC PHP versions (such as PHP 8.6 prior to GA), label test versions accurately (e.g., `8.6.0-rc1`) or keep the article in `draft` / `technical-review`.

---

## 9. GitHub Source Links

Configure `repositoryURL`, `examplePath`, and `testsPath` in frontmatter when verified source exists. Only `https://` or `http://` URLs are rendered as external links (`target="_blank" rel="noopener noreferrer"`). If `repositoryURL` is omitted, local `examplePath` and `testsPath` references still render cleanly without inventing GitHub links.

---

## 10. Series Ordering

Series membership is driven by `series` (matching `src/content/series/<slug>.json`) and `seriesOrder` (positive integer). Series prev/next links and `<SeriesNavigation />` always follow `seriesOrder`, not `publishedAt`.

---

## 11. Publication Checklist

Before changing an article to `draft: false` and `status: "published"`:

- [ ] Title, description, `publishedAt`, and `category` are accurate.
- [ ] All PHP snippets have been verified against an actual matching PHP runtime (`npm run validate:examples` or tested PHP binary).
- [ ] `testedPhpVersions` lists only runtimes actually verified.
- [ ] `examplePath` and `testsPath` exist (when specified).
- [ ] No placeholder markers (`TODO`, `FIXME`, `SAMPLE CONTENT`) remain outside code samples.
- [ ] `npm run check`, `npm test`, `npm run build`, and `npm run test:build` all pass.
