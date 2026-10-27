<?php

namespace App\Modules\Purchasing\Listeners;

use App\Modules\Inventory\Events\ProductStockChanged;
use App\Modules\Purchasing\Services\DraftPurchaseOrderGenerator;

class CreateDraftForReorder
{
    public function __construct(private DraftPurchaseOrderGenerator $generator) {}

    public function handle(ProductStockChanged $event): void
    {
        $this->generator->generate(30, [$event->productId]);
    }
}
