<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/UserBefore.php';
require_once __DIR__ . '/../src/UserProfile.php';
require_once __DIR__ . '/../src/NamedResource.php';
require_once __DIR__ . '/../src/InvoiceLine.php';

use KhorshedPro\Examples\Php84\PropertyHooks\InvoiceLine;
use KhorshedPro\Examples\Php84\PropertyHooks\PackageMetadata;
use KhorshedPro\Examples\Php84\PropertyHooks\UserBefore;
use KhorshedPro\Examples\Php84\PropertyHooks\UserProfile;

function assertSameValue(mixed $expected, mixed $actual, string $message): void
{
    if ($expected !== $actual) {
        throw new RuntimeException(
            sprintf('%s (expected %s, got %s)', $message, var_export($expected, true), var_export($actual, true))
        );
    }
}

function assertThrows(string $expectedClass, callable $fn, string $message): void
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $expectedClass) {
            return;
        }
        throw new RuntimeException(
            sprintf('%s (expected %s, threw %s)', $message, $expectedClass, $e::class)
        );
    }

    throw new RuntimeException(sprintf('%s (did not throw %s)', $message, $expectedClass));
}

// 1. Traditional PHP 8.3 class behavior
$legacy = new UserBefore('  Dev@Example.com ');
assertSameValue('dev@example.com', $legacy->getEmail(), 'UserBefore normalizes email');

// 2. Backed & virtual property hooks on UserProfile
$profile = new UserProfile('  Dev@Example.com ', '  Khorshed ', ' Alam  ');
assertSameValue('dev@example.com', $profile->email, 'UserProfile normalizes email on construct');
assertSameValue('Khorshed', $profile->firstName, 'UserProfile trims firstName');
assertSameValue('Alam', $profile->lastName, 'UserProfile trims lastName');
assertSameValue('Khorshed Alam', $profile->fullName, 'Virtual fullName computes trimmed name');

$profile->firstName = '  Alex ';
assertSameValue('Alex Alam', $profile->fullName, 'Virtual fullName reflects updated firstName');

assertThrows(
    InvalidArgumentException::class,
    static function () use ($profile): void {
        $profile->email = 'not-an-email';
    },
    'Invalid email triggers InvalidArgumentException in set hook'
);

// 3. Interface property contract
$pkg = new PackageMetadata('khorshed-pro', 'schema-validator');
assertSameValue('khorshed-pro/schema-validator', $pkg->displayName, 'NamedResource virtual property matches');

// 4. Property hook + asymmetric visibility
$line = new InvoiceLine(2);
assertSameValue(2, $line->quantity, 'Initial quantity is readable publicly');
$line->increment(3);
assertSameValue(5, $line->quantity, 'Internal increment updates quantity through set hook');

assertThrows(
    InvalidArgumentException::class,
    static fn (): InvoiceLine => new InvoiceLine(0),
    'InvoiceLine enforces minimum quantity via set hook'
);

assertThrows(
    Error::class,
    static function () use ($line): void {
        $line->quantity = 10;
    },
    'External write to public private(set) property fails'
);

echo "OK: PropertyHooksTest passed on PHP " . PHP_VERSION . PHP_EOL;
