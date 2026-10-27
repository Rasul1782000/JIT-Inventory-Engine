<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Sale;
use App\Modules\Inventory\Services\ReorderPointCalculator;
use App\Modules\Purchasing\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(ReorderPointCalculator $calculator): JsonResponse
    {
        $products = Product::query()->with('supplier')->get();
        $items = $products->map(fn (Product $product) => $calculator->calculate($product, 30));
        $skuCount = $products->count();
        $healthyCount = $items->where('status', 'healthy')->count();

        return response()->json([
            'skuCount' => $skuCount,
            'stockValue' => round($products->sum(fn (Product $product) => $product->on_hand * $product->unit_cost), 2),
            'belowReorderCount' => $items->whereIn('status', ['reorder', 'critical'])->count(),
            'openDraftCount' => PurchaseOrder::query()->where('status', 'draft')->count(),
            'unitsSold30d' => (int) Sale::query()->where('sold_at', '>=', Carbon::now()->subDays(30))->sum('quantity'),
            'inventoryHealth' => $skuCount > 0 ? (int) round(($healthyCount / $skuCount) * 100) : 100,
        ]);
    }
}
