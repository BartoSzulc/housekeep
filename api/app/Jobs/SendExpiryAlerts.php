<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendExpiryAlerts implements ShouldQueue
{
    use Queueable;

    public function handle(PushNotificationService $pushService): void
    {
        $products = Product::query()
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(3)])
            ->with('household.members')
            ->get();

        foreach ($products as $product) {
            $userIds = $product->household->members->pluck('id')->toArray();

            if (empty($userIds)) continue;

            $daysLeft = (int) today()->diffInDays($product->expiry_date, false);
            $daysText = match (true) {
                $daysLeft <= 0 => 'wygasa dziś!',
                $daysLeft === 1 => 'wygasa jutro!',
                default => "wygasa za {$daysLeft} dni",
            };

            $pushService->sendToUsers($userIds, [
                'title' => 'Zbliża się termin ważności',
                'body' => "{$product->name} — {$daysText}",
                'data' => [
                    'type' => 'product_expiry',
                    'product_uuid' => $product->uuid,
                    'household_id' => $product->household_id,
                ],
            ]);
        }
    }
}
