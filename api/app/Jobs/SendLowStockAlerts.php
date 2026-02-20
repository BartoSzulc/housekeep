<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendLowStockAlerts implements ShouldQueue
{
    use Queueable;

    public function handle(PushNotificationService $pushService): void
    {
        $products = Product::query()
            ->whereNotNull('min_quantity')
            ->whereColumn('quantity', '<=', 'min_quantity')
            ->where('quantity', '>', 0)
            ->with('household.members')
            ->get();

        foreach ($products as $product) {
            $userIds = $product->household->members->pluck('id')->toArray();

            if (empty($userIds)) continue;

            $pushService->sendToUsers($userIds, [
                'title' => 'Niski stan produktu',
                'body' => "{$product->name} — pozostało {$product->quantity} szt.",
                'data' => [
                    'type' => 'low_stock',
                    'product_uuid' => $product->uuid,
                    'household_id' => $product->household_id,
                ],
            ]);
        }
    }
}
