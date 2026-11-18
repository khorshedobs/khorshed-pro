# LinkedIn Post Package — PHP 8.5 Pipe Operator

> Status: **READY FOR MANUAL POSTING** (Article is published; copy manually to publish.)
> Estimated length: ~260 words

---

Anyone who has maintained data normalization code in PHP recognizes the inside-out nesting problem:

`array_values(array_unique(array_filter(array_map(..., explode(',', $rawTags)))))`

To read the execution flow, your eyes jump to the innermost call and work outward—or you introduce single-use `$step1`, `$step2`, `$step3` variables that add noise without domain meaning.

PHP 8.5 solves this at the syntax level with the **pipe operator (`|>`)**, evaluating left-to-right and passing the left-hand expression as the single argument to the callable on the right.

In my updated **Modern PHP Mastery** deep dive on `|>`, I walk through tested PHP 8.5.12 examples and practical production rules:

1. **Before/After Comparisons**: Replacing deeply nested function calls and throwaway variables across tag normalization and slug generation.
2. **Real Request Sanitization**: Composing built-in helpers (`trim(...)`, `strtolower(...)`) with domain callables (`Slugger::normalize(...)`, `TagNormalizer::normalizePiped(...)`) inside `PayloadSanitizer`.
3. **Precedence & Syntax Gotchas**: Why inline arrow functions (`static fn (string $v) => ...`) must be wrapped in parentheses inside a pipe chain, and why callables requiring by-reference parameters do not accept arbitrary piped r-values.
4. **Judgment Over Hype**: `|>` improves readability and composition, not execution speed by itself—and `if` / `match` or fluent domain builders remain cleaner when branching or database transactions are involved.

Read the full article and inspect the verified PHP 8.5.12 code & tests:
https://khorshed.pro/articles/php-85-pipe-operator/?utm_source=linkedin&utm_medium=social&utm_campaign=modern-php-mastery&utm_content=php-85-pipe-operator

Where does left-to-right piping clean up your controllers or DTO mappers most?

#PHP #PHP85 #FunctionalPHP #ModernPHP #BackendDevelopment
