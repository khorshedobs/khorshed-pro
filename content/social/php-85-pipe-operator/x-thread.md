# X Thread Package — PHP 8.5 Pipe Operator

> Status: **READY FOR MANUAL POSTING** (Article is published; copy manually to publish.)
> Every post below is validated at <= 280 characters.

## Post 1
1/5 Reading nested PHP calls like `array_values(array_unique(array_filter(...)))` forces you to parse code inside-out.

PHP 8.5 introduces the left-to-right pipe operator (`|>`). Here is how it works in practice:

## Post 2
2/5 With `|>`, data flows top-to-bottom:

```php
explode(',', $raw)
  |> (static fn ($a) => array_map(trim(...), $a))
  |> array_filter(...)
  |> array_unique(...)
  |> array_values(...);
```

## Post 3
3/5 Key rule to remember:

Wrap inline arrow functions in parentheses before the next `|>` step so operator precedence does not bind loosely around `fn (...) => ...`.

## Post 4
4/5 Keep expectations realistic: `|>` is a readability and composition feature, not a free runtime speedup. Skip it when mid-pipeline branching or side effects need `match` or explicit state.

## Post 5
5/5 Full deep dive with PayloadSanitizer examples tested on PHP 8.5.12:
https://khorshed.pro/articles/php-85-pipe-operator/?utm_source=x&utm_medium=social&utm_campaign=modern-php-mastery&utm_content=php-85-pipe-operator
