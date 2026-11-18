<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php84\PropertyHooks;

use InvalidArgumentException;

final class UserBefore
{
    private string $email;

    public function __construct(string $email)
    {
        $this->setEmail($email);
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $normalized = strtolower(trim($email));

        if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('A valid email address is required.');
        }

        $this->email = $normalized;
    }
}
