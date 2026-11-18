# PHP 8.5 Pipe Operator Example

Companion source code for **PHP 8.5 Pipe Operator: Readable Left-to-Right Data Transformations**.

## Requirements

- PHP `>= 8.5`

## Files

- `src/TagNormalizer.php` — Side-by-side nested vs. piped tag array normalization
- `src/Slugger.php` — Slug normalization pipeline with `|>` and first-class callables
- `tests/PipeOperatorTest.php` — Executable assertion suite

## Run Locally

```bash
php -l src/*.php tests/*.php
php tests/PipeOperatorTest.php
```
