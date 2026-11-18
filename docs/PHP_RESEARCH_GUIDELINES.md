# PHP Research & Technical Verification Guidelines

Engineering rules for researching, verifying, and documenting PHP 8.0 through PHP 8.6 features for **khorshed.pro**.

---

## 1. Authoritative Source Hierarchy

Consult primary sources before writing prose or code examples:

1. **PHP Official Manual (`https://www.php.net/manual/en/`)** and release notes (`https://www.php.net/releases/<version>/en.php`)
2. **Official PHP RFCs (`https://wiki.php.net/rfc/...`)** — distinguish *Accepted / Implemented* RFCs from *Under Discussion* or *Declined* proposals
3. **Direct execution** against installed PHP binaries matching `minimumPhpVersion` (`declare(strict_types=1);` enabled in every example)

Never cite third-party summaries or unverified AI paraphrases as canonical language behavior without confirming against PHP docs, RFC semantics, or runtime output.

---

## 2. Companion Example & Test Standards

Store verified code for each topic under:

```text
examples/
  php-<major>-<minor>/
    <topic-slug>/
      src/
      tests/
```

Requirements for companion examples:

- Every PHP file begins with `<?php` and `declare(strict_types=1);`.
- Tests exercise both expected happy paths and boundary/exception paths (e.g., `InvalidArgumentException` on invalid email or quantity).
- Articles reference concrete paths via `examplePath` and `testsPath` in frontmatter, which `npm run validate:articles` verifies exist on disk.

---

## 3. Running Verification Across Environments

- **Local check:** `npm run validate:examples` executes `php -l` and test files using locally installed PHP binaries (automatically marking examples requiring newer PHP versions as `UNVERIFIED / SKIPPED` when the local runtime is older).
- **CI matrix (`.github/workflows/validate.yml`):** Automatically tests PHP `8.4` and `8.5` companion examples in GitHub Actions on push and pull requests.
- **Target host / provisioned runtimes:** Run version-specific suites directly on `php8.4` / `php8.5` binaries and record the exact tested patch versions in `testedPhpVersions` (for example `["8.4.27", "8.5.12"]`).

---

## 4. Pre-Release PHP Version Rule (PHP 8.6 Policy)

- Until `php.net` confirms **PHP 8.6.0** general availability and runnable assertions execute cleanly against an installed PHP 8.6 runtime:
  - Keep `draft: true` and `status` in `drafting` or `technical-review`.
  - Set `technicalVerificationStatus: "awaiting-php-release"` and leave `testedPhpVersions: []`.
  - Clearly label RFC concepts (`partial_function_application_v2`, `clamp_v2`, `poll_api`, `Time\Duration`) as pre-GA material rather than already-tested production behavior.
