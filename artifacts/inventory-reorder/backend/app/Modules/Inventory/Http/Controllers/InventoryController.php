<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Events\ProductStockChanged;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Services\ReorderPointCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InventoryController extends Controller
{
    public function index(Request $request, ReorderPointCalculator $calculator): JsonResponse
    {
        $validated = $request->validate(['window' => ['sometimes', 'integer', Rule::in([30, 60, 90])]]);
        $window = (int) ($validated['window'] ?? 30);

        $items = Product::query()
            ->with('supplier')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => $calculator->calculate($product, $window));

        return response()->json($items->values());
    }

    public function store(Request $request, ReorderPointCalculator $calculator): JsonResponse
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:120'],
            'supplierId' => ['required', 'integer', 'exists:suppliers,id'],
            'unitCost' => ['required', 'numeric', 'min:0'],
            'onHand' => ['required', 'integer', 'min:0'],
            'safetyStockDays' => ['required', 'integer', 'min:0', 'max:365'],
        ]);

        $product = Product::create([
            'sku' => $data['sku'],
            'name' => $data['name'],
            'category' => $data['category'] ?? 'Uncategorized',
            'supplier_id' => $data['supplierId'],
            'unit_cost' => $data['unitCost'],
            'on_hand' => $data['onHand'],
            'safety_stock_days' => $data['safetyStockDays'],
        ])->load('supplier');

        return response()->json($calculator->calculate($product), 201);
    }

    public function update(Request $request, int $id, ReorderPointCalculator $calculator): JsonResponse
    {
        $product = Product::query()->findOrFail($id);
        $data = $request->validate([
            'onHand' => ['sometimes', 'integer', 'min:0'],
            'safetyStockDays' => ['sometimes', 'integer', 'min:0', 'max:365'],
            'supplierId' => ['sometimes', 'integer', 'exists:suppliers,id'],
            'unitCost' => ['sometimes', 'numeric', 'min:0'],
        ]);

        if ($data === []) {
            return response()->json(['message' => 'Provide at least one field to update.'], 422);
        }

        $stockChanged = array_key_exists('onHand', $data) && $product->on_hand !== $data['onHand'];
        $product->fill([
            ...array_key_exists('onHand', $data) ? ['on_hand' => $data['onHand']] : [],
            ...array_key_exists('safetyStockDays', $data) ? ['safety_stock_days' => $data['safetyStockDays']] : [],
            ...array_key_exists('supplierId', $data) ? ['supplier_id' => $data['supplierId']] : [],
            ...array_key_exists('unitCost', $data) ? ['unit_cost' => $data['unitCost']] : [],
        ])->save();

        if ($stockChanged) {
            ProductStockChanged::dispatch($product->id);
        }

        return response()->json($calculator->calculate($product->fresh('supplier')));
    }
}
