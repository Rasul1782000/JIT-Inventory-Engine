<?php

namespace Database\Seeders;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Sale;
use App\Modules\Suppliers\Models\Supplier;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (Supplier::query()->exists()) {
            return;
        }

        $suppliers = [
            Supplier::create(['name' => 'Northstar Supply', 'contact_name' => 'Maya Chen', 'email' => 'maya@northstar.example', 'lead_time_days' => 12]),
            Supplier::create(['name' => 'Field & Form Co.', 'contact_name' => 'Luca Reed', 'email' => 'orders@fieldform.example', 'lead_time_days' => 8]),
            Supplier::create(['name' => 'Meridian Goods', 'contact_name' => 'Sam Rivera', 'email' => 'supply@meridian.example', 'lead_time_days' => 18]),
        ];

        $items = [
            ['sku' => 'MUG-204', 'name' => 'Ceramic travel mug', 'category' => 'Drinkware', 'supplier_id' => $suppliers[0]->id, 'unit_cost' => 8.40, 'on_hand' => 22, 'safety_stock_days' => 5, 'sales_per_day' => 1.2],
            ['sku' => 'BAG-118', 'name' => 'Canvas market tote', 'category' => 'Accessories', 'supplier_id' => $suppliers[1]->id, 'unit_cost' => 6.75, 'on_hand' => 64, 'safety_stock_days' => 6, 'sales_per_day' => 0.75],
            ['sku' => 'BOT-330', 'name' => 'Insulated steel bottle', 'category' => 'Drinkware', 'supplier_id' => $suppliers[2]->id, 'unit_cost' => 12.20, 'on_hand' => 9, 'safety_stock_days' => 4, 'sales_per_day' => 0.85],
            ['sku' => 'NOTE-052', 'name' => 'Recycled paper notebook', 'category' => 'Stationery', 'supplier_id' => $suppliers[1]->id, 'unit_cost' => 3.10, 'on_hand' => 41, 'safety_stock_days' => 7, 'sales_per_day' => 0.5],
            ['sku' => 'LAMP-091', 'name' => 'Desk lamp, warm white', 'category' => 'Home', 'supplier_id' => $suppliers[0]->id, 'unit_cost' => 21.50, 'on_hand' => 6, 'safety_stock_days' => 4, 'sales_per_day' => 0.4],
        ];

        foreach ($items as $item) {
            $dailySales = $item['sales_per_day'];
            unset($item['sales_per_day']);
            $product = Product::create($item);

            foreach ([1, 2, 3] as $period) {
                $quantity = (int) round($dailySales * 30 * (0.92 + ($period * 0.04)));
                Sale::create([
                    'product_id' => $product->id,
                    'quantity' => max(1, $quantity),
                    'sold_at' => now()->subDays(($period - 1) * 30 + 2),
                ]);
            }
        }
    }
}
