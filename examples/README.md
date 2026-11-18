# khorshed.pro — Verified PHP Examples

This directory contains runnable, version-scoped PHP source examples paired with technical articles in **Modern PHP Mastery: 8.0 → 8.6**.

## Directory Structure

```text
examples/
├── php-8-0/
├── php-8-1/
├── php-8-2/
├── php-8-3/
├── php-8-4/
│   └── property-hooks/
├── php-8-5/
│   └── pipe-operator/
└── php-8-6/
    └── partial-function-application/
```

Each complete example includes:

- `composer.json` declaring the minimum required PHP version (`"php": ">=8.4"`, etc.)
- `README.md` explaining setup, expected output, and what is tested
- `src/` runnable PHP source files
- `tests/` deterministic assertion scripts

## Running Validation

From the repository root:

```bash
npm run validate:examples
```

Examples requiring a PHP version newer than the locally available PHP binary are explicitly reported as **unverified/skipped** rather than falsely marked passing or failing.

## Extracting Into a Separate Repository

This directory is intentionally self-contained so it can later be split into a dedicated GitHub repository (for example, via `git subtree split --prefix=examples -b examples-repo`) and linked directly from article frontmatter via `repositoryURL` and `examplePath`.
