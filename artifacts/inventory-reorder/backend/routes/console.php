<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Modules\Purchasing\Services\DraftPurchaseOrderGenerator;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => app(DraftPurchaseOrderGenerator::class)->generate(30))
    ->everyFifteenMinutes()
    ->name('inventory-reorder-scan')
    ->withoutOverlapping();
