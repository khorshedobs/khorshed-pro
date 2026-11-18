# PHP Example Validation Guide (`khorshed.pro`)

This document explains how companion PHP examples in [examples/](file:///Volumes/RobelExt/Web/khorshedpro/examples/README.md) are organized, syntax-checked, and executed.

---

## 1. Directory Structure

Examples are organized by major/minor PHP version and article topic:

```text
examples/
├── php-8-0/
├── php-8-1/
├── php-8-2/
├── php-8-3/
├── php-8-4/
│   └── property-hooks/
│       ├── composer.json
│       ├── README.md
│       ├── src/
│       └── tests/
├── php-8-5/
│   └── pipe-operator/
│       ├── composer.json
│       ├── README.md
│       ├── src/
│       └── tests/
└── php-8-6/
    └── partial-function-application/
        └── README.md
```

Each runnable example package includes:

- `composer.json` declaring its minimum PHP requirement (`"php": ">=8.4"`, `"php": ">=8.5"`).
- `README.md` with file list and commands.
- `src/` containing self-contained PHP classes/functions.
- `tests/` containing assertion-based tests (`*Test.php`).

---

## 2. Running Validation Locally

Run the automated example validator:

```bash
npm run validate:examples
```

How `scripts/validate-examples.mjs` works:

1. Discovers PHP CLI binaries available on `PATH` (or via `PHP86_BIN`, `PHP85_BIN`, `PHP84_BIN`, `PHP_BIN`).
2. Reads `require.php` from each example's `composer.json`.
3. Runs `php -l` syntax checks on all `src/*.php` and `tests/*.php` files and executes `tests/*Test.php` **only when a compatible PHP binary (`>= required version`) is present**.
4. Explicitly logs `UNVERIFIED / SKIPPED` for examples whose required PHP version is not installed on the local machine—never misreporting PHP 8.4/8.5 syntax errors under an older local PHP runtime such as PHP 7.4 or PHP 8.3.

---

## 3. Running in CI (GitHub Actions)

The workflow in [.github/workflows/validate.yml](file:///Volumes/RobelExt/Web/khorshedpro/.github/workflows/validate.yml) validates:

- `site-checks`: `npm run check`, `npm test`, and `npm run build`
- `php-examples`: Matrix across PHP `8.4` and `8.5` executing `node scripts/validate-examples.mjs`

No deployment secrets are stored in this workflow.

---

## 4. What Automated Checks Validate vs. Manual Review

**Automated checks verify:**

- PHP syntax validity (`php -l`) under a compatible PHP runtime
- Assertion test behavior (`PropertyHooksTest.php`, `PipeOperatorTest.php`)
- Frontmatter metadata integrity, series ordering uniqueness, placeholder absence, and draft exclusion (`npm run validate:articles`, `npm test`)

**Manual editorial review is still required for:**

- Architectural trade-offs, performance advice, and security warnings
- Whether an example accurately represents idiomatic production usage
- Verifying inline article snippets stay aligned with `examples/` source files

---

## 5. Handling Unreleased or Future PHP Versions (e.g. PHP 8.6)

As of November 18, 2026, PHP 8.6 GA has not yet been released.

1. Keep PHP 8.6 articles in `draft: true` / `status: "draft"` until a final PHP 8.6 runtime binary is available for testing.
2. Never add `"8.6"` to `testedPhpVersions` unless tested directly against an actual PHP 8.6 build (and label RC builds explicitly such as `"8.6.0-rc1"`).
3. Keep `examples/php-8-6/partial-function-application/` documented as unverified until tested against a provisioned PHP 8.6 runtime.
