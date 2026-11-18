<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php85\PipeOperator;

final class TagNormalizer
{
    /**
     * @return list<string>
     */
    public static function normalizeNested(string $rawTags): array
    {
        return array_values(
            array_unique(
                array_filter(
                    array_map(
                        static fn (string $tag): string => strtolower(trim($tag)),
                        explode(',', $rawTags)
                    )
                )
            )
        );
    }

    /**
     * @return list<string>
     */
    public static function normalizePiped(string $rawTags): array
    {
        return explode(',', $rawTags)
            |> (static fn (array $items): array => array_map(
                static fn (string $tag): string => strtolower(trim($tag)),
                $items
            ))
            |> array_filter(...)
            |> array_unique(...)
            |> array_values(...);
    }
}
