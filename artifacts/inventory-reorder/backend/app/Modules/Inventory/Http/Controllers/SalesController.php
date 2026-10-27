<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Events\ProductStockChanged;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Sale;
use App\Modules\Inventory\Services\ReorderPointCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function store(Request $request, ReorderPointCalculator $calculator): JsonResponse
    {
        $data = $request->validate([
            'productId' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $productId = (int) $data['productId'];
        $product = DB::transaction(function () use ($data, $productId): Product {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);

            if ($product->on_hand < $data['quantity']) {
                abort(422, 'Sale quantity cannot exceed available stock.');
            }

            Sale::create([
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'sold_at' => now(),
            ]);

            $product->decrement('on_hand', $data['quantity']);

            return $product->fresh('supplier');
        });

        ProductStockChanged::dispatch($product->id);

        return response()->json($calculator->calculate($product));
    }
}
