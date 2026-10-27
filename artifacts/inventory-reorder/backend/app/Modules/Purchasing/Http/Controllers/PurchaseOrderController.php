<?php

namespace App\Modules\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Purchasing\Models\PurchaseOrder;
use App\Modules\Purchasing\Services\DraftPurchaseOrderGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = PurchaseOrder::query()
            ->with(['supplier', 'items'])
            ->latest()
            ->get()
            ->map(fn (PurchaseOrder $order) => $this->serialize($order));

        return response()->json($orders->values());
    }

    public function generate(Request $request, DraftPurchaseOrderGenerator $generator): JsonResponse
    {
        $data = $request->validate([
            'window' => ['sometimes', 'integer', Rule::in([30, 60, 90])],
        ]);
        $orders = $generator->generate((int) ($data['window'] ?? 30));

        return response()->json([
            'createdCount' => $orders->count(),
            'purchaseOrders' => $orders->map(fn (PurchaseOrder $order) => $this->serialize($order))->values(),
        ], 201);
    }

    private function serialize(PurchaseOrder $order): array
    {
        return [
            'id' => $order->id,
            'reference' => $order->reference,
            'supplierId' => $order->supplier_id,
            'supplierName' => $order->supplier->name,
            'status' => $order->status,
            'itemCount' => $order->items->count(),
            'total' => round($order->items->sum(fn ($item) => $item->quantity * $item->unit_cost), 2),
            'createdAt' => $order->created_at?->toISOString(),
        ];
    }
}
