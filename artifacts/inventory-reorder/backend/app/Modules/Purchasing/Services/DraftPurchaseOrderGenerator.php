<?php

namespace App\Modules\Purchasing\Services;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Services\ReorderPointCalculator;
use App\Modules\Purchasing\Models\PurchaseOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DraftPurchaseOrderGenerator
{
    public function __construct(private ReorderPointCalculator $calculator) {}

    /**
     * Create one draft per supplier for qualifying products. Existing drafts
     * prevent duplicate suggested quantities for the same SKU.
     */
    public function generate(int $window = 30, ?array $productIds = null): Collection
    {
        return DB::transaction(function () use ($window, $productIds): Collection {
            $query = Product::query()->with('supplier')->orderBy('id')->lockForUpdate();

            if ($productIds !== null) {
                $query->whereIn('id', $productIds);
            }

            $productsBySupplier = [];

            foreach ($query->get() as $product) {
                $metrics = $this->calculator->calculate($product, $window);

                if ($product->on_hand > $metrics['reorderPoint'] || $metrics['averageDailySales'] <= 0) {
                    continue;
                }

                $alreadyDrafted = $product->purchaseOrderItems()
                    ->whereHas('purchaseOrder', fn ($order) => $order->where('status', 'draft'))
                    ->exists();

                if ($alreadyDrafted) {
                    continue;
                }

                $targetStock = (int) ceil($metrics['reorderPoint'] + ($metrics['averageDailySales'] * 14));
                $quantity = max(1, $targetStock - $product->on_hand);
                $productsBySupplier[$product->supplier_id][] = [
                    'product' => $product,
                    'quantity' => $quantity,
                ];
            }

            $orders = collect();

            foreach ($productsBySupplier as $supplierId => $lines) {
                $order = PurchaseOrder::create([
                    'reference' => 'PO-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
                    'supplier_id' => $supplierId,
                    'status' => 'draft',
                ]);

                foreach ($lines as $line) {
                    $order->items()->create([
                        'product_id' => $line['product']->id,
                        'quantity' => $line['quantity'],
                        'unit_cost' => $line['product']->unit_cost,
                    ]);
                }

                $orders->push($order->load(['supplier', 'items']));
            }

            return $orders;
        });
    }
}
