<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php85\PipeOperator;

final class PayloadSanitizer
{
    /**
     * @param array{email?: string, tags?: string, title?: string} $payload
     * @return array{email: string, slug: string, tags: list<string>}
     */
    public static function sanitize(array $payload): array
    {
        $email = ($payload['email'] ?? '')
            |> trim(...)
            |> strtolower(...);

        $slug = ($payload['title'] ?? '')
            |> Slugger::normalize(...);

        $tags = ($payload['tags'] ?? '')
            |> TagNormalizer::normalizePiped(...);

        return [
            'email' => $email,
            'slug' => $slug,
            'tags' => $tags,
        ];
    }
}
