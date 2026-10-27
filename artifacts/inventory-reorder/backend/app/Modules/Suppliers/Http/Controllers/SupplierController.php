<?php

namespace App\Modules\Suppliers\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Suppliers\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        $suppliers = Supplier::query()->orderBy('name')->get()->map(fn (Supplier $supplier) => [
            'id' => $supplier->id,
            'name' => $supplier->name,
            'contactName' => $supplier->contact_name,
            'email' => $supplier->email,
            'leadTimeDays' => $supplier->lead_time_days,
            'integrationStatus' => $supplier->integration_status,
        ]);

        return response()->json($suppliers->values());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contactName' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'leadTimeDays' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        $supplier = Supplier::create([
            'name' => $data['name'],
            'contact_name' => $data['contactName'] ?? null,
            'email' => $data['email'] ?? null,
            'lead_time_days' => $data['leadTimeDays'],
            'integration_status' => 'manual',
        ]);

        return response()->json([
            'id' => $supplier->id,
            'name' => $supplier->name,
            'contactName' => $supplier->contact_name,
            'email' => $supplier->email,
            'leadTimeDays' => $supplier->lead_time_days,
            'integrationStatus' => $supplier->integration_status,
        ], 201);
    }
}
