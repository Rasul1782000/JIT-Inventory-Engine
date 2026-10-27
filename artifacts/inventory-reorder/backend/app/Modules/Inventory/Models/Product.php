<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Purchasing\Models\PurchaseOrderItem;
use App\Modules\Suppliers\Models\Supplier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['sku', 'name', 'category', 'supplier_id', 'unit_cost', 'on_hand', 'safety_stock_days'];

    protected function casts(): array
    {
        return ['unit_cost' => 'float', 'on_hand' => 'integer', 'safety_stock_days' => 'integer'];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
