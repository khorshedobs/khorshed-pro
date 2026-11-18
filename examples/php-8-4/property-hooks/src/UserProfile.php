<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php84\PropertyHooks;

use InvalidArgumentException;

final class UserProfile
{
    public string $email {
        set (string $value) {
            $normalized = strtolower(trim($value));

            if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('A valid email address is required.');
            }

            $this->email = $normalized;
        }
    }

    public string $firstName {
        set => trim($value);
    }

    public string $lastName {
        set => trim($value);
    }

    // Virtual property: no backing storage is allocated for $fullName
    public string $fullName {
        get => trim($this->firstName . ' ' . $this->lastName);
    }

    public function __construct(
        string $email,
        string $firstName,
        string $lastName,
    ) {
        $this->email = $email;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
    }
}
