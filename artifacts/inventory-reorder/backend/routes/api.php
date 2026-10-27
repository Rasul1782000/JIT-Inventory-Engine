<?php

use App\Modules\Inventory\Http\Controllers\DashboardController;
use App\Modules\Inventory\Http\Controllers\InventoryController;
use App\Modules\Inventory\Http\Controllers\SalesController;
use App\Modules\Purchasing\Http\Controllers\PurchaseOrderController;
use App\Modules\Suppliers\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', DashboardController::class);
Route::get('/inventory', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::patch('/inventory/{id}', [InventoryController::class, 'update'])->whereNumber('id');
Route::post('/sales', [SalesController::class, 'store']);
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);
Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
Route::post('/purchase-orders/drafts', [PurchaseOrderController::class, 'generate']);
