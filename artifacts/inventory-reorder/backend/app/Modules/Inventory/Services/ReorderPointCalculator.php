<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Product;
use Illuminate\Support\Carbon;

class ReorderPointCalculator
{
    public function calculate(Product $product, int $window = 30): array
    {
        $window = in_array($window, [30, 60, 90], true) ? $window : 30;
        $unitsSold = (int) $product->sales()
            ->where('sold_at', '>=', Carbon::now()->subDays($window))
            ->sum('quantity');

        $averageDailySales = $unitsSold / $window;
        $leadTimeDemand = $averageDailySales * (int) $product->supplier->lead_time_days;
        $safetyStock = $averageDailySales * (int) $product->safety_stock_days;
        $reorderPoint = (int) ceil($leadTimeDemand + $safetyStock);
        $projectedDaysCover = $averageDailySales > 0
            ? round($product->on_hand / $averageDailySales, 1)
            : 0;

        $status = $product->on_hand <= 0 || $product->on_hand <= $leadTimeDemand
            ? 'critical'
            : ($product->on_hand <= $reorderPoint ? 'reorder' : 'healthy');

        return [
            'id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'category' => $product->category,
            'supplierId' => $product->supplier_id,
            'supplierName' => $product->supplier->name,
            'unitCost' => (float) $product->unit_cost,
            'onHand' => (int) $product->on_hand,
            'leadTimeDays' => (int) $product->supplier->lead_time_days,
            'safetyStockDays' => (int) $product->safety_stock_days,
            'averageDailySales' => round($averageDailySales, 2),
            'leadTimeDemand' => round($leadTimeDemand, 2),
            'safetyStock' => round($safetyStock, 2),
            'reorderPoint' => $reorderPoint,
            'projectedDaysCover' => $projectedDaysCover,
            'salesWindow' => $window,
            'status' => $status,
        ];
    }
}
