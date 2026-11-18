# LinkedIn Post Package — PHP 8.6 Partial Function Application (DRAFT)

> Status: **DRAFT / DO NOT PUBLISH YET** (Article status: `technical-review`, draft: `true`, verification: `awaiting-php-release`). Hold until PHP 8.6.0 GA confirmation (scheduled Nov 19, 2026) and runtime example verification under `examples/php-8-6/partial-function-application/`.

---

PHP 8.5 gave us the pipe operator (`|>`)—making single-argument function composition clean from left to right.

But anyone trying to chain `str_replace()`, `implode()`, or `array_map()` immediately hit a friction point: standard-library functions frequently take two or three parameters, and the piped value is not always the only argument needed. So you still end up allocating explicit wrapper closures just to bind static configuration arguments ahead of time.

In **PHP 8.6 Partial Function Application: Beyond Simple Callbacks** (currently in technical review ahead of the scheduled November 19, 2026 PHP 8.6.0 release), I explore how the accepted **Partial Function Application (`partial_function_application_v2`)** design closes that ergonomics gap:

1. **Positional (`?`) vs. variadic (`...`) placeholders**: Reserving individual open slots vs. forwarding remaining trailing arguments without manual closure ceremony.
2. **Deferred execution & evaluation order**: Why arguments supplied during partial creation evaluate at construction time while execution waits until the open placeholders are filled.
3. **Preserved signatures & type safety**: Keeping underlying parameter constraints and return types intact across `array_filter`, `array_map`, and middleware adapters.

Before publishing this guide, every runnable snippet will be placed in a full test suite and executed against the final PHP 8.6 GA runtime.

Target article URL (hold until published):
https://khorshed.pro/articles/php-86-partial-function-application/?utm_source=linkedin&utm_medium=social&utm_campaign=modern-php-mastery&utm_content=php-86-partial-function-application

Which standard PHP functions feel clunkiest to wrap in closures inside your `|>` pipelines today?

#PHP #PHP86 #FunctionalPHP #ModernPHP #SoftwareArchitecture
