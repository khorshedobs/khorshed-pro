<?php

declare(strict_types=1);

namespace KhorshedPro\Examples\Php84\PropertyHooks;

use InvalidArgumentException;

final class InvoiceLine
{
    public private(set) int $quantity {
        set (int $value) {
            if ($value < 1) {
                throw new InvalidArgumentException('Quantity must be at least 1.');
            }

            $this->quantity = $value;
        }
    }

    public function __construct(int $quantity)
    {
        $this->quantity = $quantity;
    }

    public function increment(int $by = 1): void
    {
        $this->quantity += $by;
    }
}
