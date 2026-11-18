# Facebook Post Package — PHP 8.6 Partial Function Application (DRAFT)

> Status: **DRAFT / DO NOT PUBLISH YET** (Article status: `technical-review`, draft: `true`, verification: `awaiting-php-release`). Hold until PHP 8.6.0 GA confirmation and runtime test verification.

---

PHP 8.5's pipe operator (`|>`) solved single-argument nesting, but multi-parameter functions like `str_replace()` and `array_map()` still required wrapper closures.

This technical review draft explores PHP 8.6 Partial Function Application (`partial_function_application_v2`):

- Comparing PHP 8.5 closure ceremony vs. positional (`?`) placeholders
- Variadic (`...`) forwarding and evaluation order semantics
- Cleaner `|>` chains, array callbacks, and validation adapters

Target URL once published and verified on PHP 8.6 GA:
https://khorshed.pro/articles/php-86-partial-function-application/?utm_source=facebook&utm_medium=social&utm_campaign=modern-php-mastery&utm_content=php-86-partial-function-application
