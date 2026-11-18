# PHP 8.4 Property Hooks Example

Companion source code for **PHP 8.4 Property Hooks: Computed and Validated State Without Boilerplate**.

## Requirements

- PHP `>= 8.4`

## Files

- `src/UserBefore.php` — Traditional PHP 8.3 private property + getter/setter pattern
- `src/UserProfile.php` — Backed `get`/`set` validation hooks and virtual `$fullName` hook
- `src/NamedResource.php` — Interface property hook requirement (`{ get; }`)
- `src/InvoiceLine.php` — `set` hook paired with PHP 8.4 asymmetric visibility (`public private(set)`)
- `tests/PropertyHooksTest.php` — Executable assertion suite

## Run Locally

```bash
php -l src/*.php tests/*.php
php tests/PropertyHooksTest.php
```
