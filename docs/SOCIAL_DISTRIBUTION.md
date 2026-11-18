# Social Distribution Guide — khorshed.pro

Workflow and content standards for distributing published **khorshed.pro** articles across LinkedIn, Facebook, and X while keeping social copy strictly manual-post-only and technically honest.

---

## 1. Directory Structure & Generator

Every article's social distribution kit lives under:

```text
content/social/<slug>/
  linkedin.md
  facebook.md
  x-thread.md
  metadata.json
```

Scaffold missing social kits with:

```bash
npm run social:generate -- --slug <article-slug>
# Or for all articles (skips existing files unless --force is passed):
npm run social:generate -- --all
```

Social kits are stored as repository Markdown/JSON files for manual copy-and-paste review—no external social API keys or automated publishing jobs exist in this repository.

---

## 2. UTM Tracking Conventions (`src/lib/utm.ts`)

`buildSocialTrackingUrl()` generates consistent attribution links on every canonical `https://khorshed.pro/articles/<slug>/` URL:

| Platform | `utm_source` | `utm_medium` | `utm_campaign` | `utm_content` |
| --- | --- | --- | --- | --- |
| LinkedIn | `linkedin` | `social` | `modern-php-mastery` | `<slug>` |
| Facebook | `facebook` | `social` | `modern-php-mastery` | `<slug>` |
| X | `x` | `social` | `modern-php-mastery` | `<slug>` |

---

## 3. Platform Copy Standards

- **LinkedIn (`linkedin.md`):** Target 250–500 words. Open with a concrete engineering problem, highlight 3–4 technical insights grounded directly in the published article, include the UTM link cleanly near the end, and close with an authentic technical question. Never fabricate metrics or production stories.
- **Facebook (`facebook.md`):** Clear developer community summary with scannable takeaway bullets and the canonical UTM URL.
- **X Thread (`x-thread.md`):** Break insights into numbered `## Post N` sections (`1/N` ... `N/N`). Every individual post MUST be `<= 280` characters (checked automatically by `npm run validate:articles` and `npm test`).

---

## 4. Pre-Release & Draft Gate

Articles in `idea`, `researching`, `drafting`, `draft`, `technical-review`, `editorial-review`, or `ready` states must mark every generated social file as **`DRAFT / DO NOT PUBLISH YET`** and keep `readyForManualPosting: false` in `metadata.json`. Only share social posts after runtime verification succeeds and the article goes live.
