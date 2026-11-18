<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/TagNormalizer.php';
require_once __DIR__ . '/../src/Slugger.php';

use KhorshedPro\Examples\Php85\PipeOperator\Slugger;
use KhorshedPro\Examples\Php85\PipeOperator\TagNormalizer;

function assertSameValue(mixed $expected, mixed $actual, string $message): void
{
    if ($expected !== $actual) {
        throw new RuntimeException(
            sprintf('%s (expected %s, got %s)', $message, var_export($expected, true), var_export($actual, true))
        );
    }
}

$raw = ' PHP, Laravel , php, WordPress , ';
$expectedTags = ['php', 'laravel', 'wordpress'];

assertSameValue($expectedTags, TagNormalizer::normalizeNested($raw), 'Nested tag normalization matches');
assertSameValue($expectedTags, TagNormalizer::normalizePiped($raw), 'Piped tag normalization matches');
assertSameValue('modern-php-mastery', Slugger::normalize('  Modern PHP Mastery!  '), 'Slugger normalizes title');
assertSameValue('php-8-5-pipe-operator', Slugger::normalize('  PHP 8.5: Pipe Operator |>  '), 'Slugger strips punctuation');

echo "OK: PipeOperatorTest passed on PHP " . PHP_VERSION . PHP_EOL;
