<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php84\PropertyHooks;

interface NamedResource
{
    public string $displayName { get; }
}

final class PackageMetadata implements NamedResource
{
    public function __construct(
        public readonly string $vendor,
        public readonly string $package,
    ) {}

    public string $displayName {
        get => "{$this->vendor}/{$this->package}";
    }
}
