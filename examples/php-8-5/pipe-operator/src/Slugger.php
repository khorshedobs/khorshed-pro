<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php85\PipeOperator;

final class Slugger
{
    public static function normalize(string $title): string
    {
        return $title
            |> trim(...)
            |> strtolower(...)
            |> (static fn (string $value): string => preg_replace('/[^a-z0-9]+/', '-', $value) ?? '')
            |> (static fn (string $value): string => trim($value, '-'));
    }
}
