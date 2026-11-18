# X Thread Package — PHP 8.6 Partial Function Application (DRAFT)

> Status: **DRAFT / DO NOT PUBLISH YET** (Article status: `technical-review`, draft: `true`, verification: `awaiting-php-release`). Hold until PHP 8.6.0 GA confirmation and runtime verification.
> Every post below is validated at <= 280 characters.

## Post 1
1/4 PHP 8.5's `|>` pipe operator simplified single-argument chaining, yet multi-argument functions like `str_replace()` still forced boilerplate closures (`static fn ($v) => ...`).

PHP 8.6 targets that gap with Partial Function Application. Here is the RFC model:

## Post 2
2/4 Conceptual comparison inside a pipe chain:

Instead of `|> (static fn ($v) => str_replace(' ', '-', $v))`, `partial_function_application_v2` binds known arguments inline and leaves open slots (`?` / `...`) for invocation.

## Post 3
3/4 Key details covered in the draft:

- Positional `?` vs. variadic `...` placeholders
- Eager binding of supplied arguments vs. deferred execution
- Signature & type preservation across `array_map`, `array_filter`, and adapters

## Post 4
4/4 [Hold until PHP 8.6.0 GA & runtime verification] Read the full breakdown:
https://khorshed.pro/articles/php-86-partial-function-application/?utm_source=x&utm_medium=social&utm_campaign=modern-php-mastery&utm_content=php-86-partial-function-application
