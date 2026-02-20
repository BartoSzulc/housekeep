<?php

namespace App\Services;

use App\Models\WebPushSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushNotificationService
{
    private string $expoApiUrl = 'https://exp.host/--/api/v2/push/send';

    public function sendToTokens(array $tokens, array $notification): void
    {
        $this->sendExpo($tokens, $notification);
    }

    public function sendToUsers(array $userIds, array $notification): void
    {
        $tokens = \App\Models\PushToken::whereIn('user_id', $userIds)
            ->pluck('token')
            ->toArray();
        $this->sendExpo($tokens, $notification);

        $subscriptions = WebPushSubscription::whereIn('user_id', $userIds)->get();
        $this->sendWebPush($subscriptions, $notification);
    }

    private function sendExpo(array $tokens, array $notification): void
    {
        if (empty($tokens)) {
            return;
        }

        $messages = array_map(fn (string $token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $notification['title'],
            'body' => $notification['body'],
            'data' => $notification['data'] ?? [],
        ], $tokens);

        foreach (array_chunk($messages, 100) as $chunk) {
            Http::post($this->expoApiUrl, $chunk);
        }
    }

    private function sendWebPush($subscriptions, array $notification): void
    {
        if ($subscriptions->isEmpty()) {
            return;
        }

        $vapidPublicKey = config('services.vapid.public_key');
        $vapidPrivateKey = config('services.vapid.private_key');

        if (!$vapidPublicKey || !$vapidPrivateKey) {
            return;
        }

        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject' => config('app.url', 'https://housekeep.tojest.dev'),
                    'publicKey' => $vapidPublicKey,
                    'privateKey' => $vapidPrivateKey,
                ],
            ]);

            $payload = json_encode([
                'title' => $notification['title'],
                'body' => $notification['body'],
                'data' => $notification['data'] ?? [],
            ]);

            foreach ($subscriptions as $sub) {
                $webPush->queueNotification(
                    Subscription::create([
                        'endpoint' => $sub->endpoint,
                        'publicKey' => $sub->p256dh_key,
                        'authToken' => $sub->auth_token,
                    ]),
                    $payload
                );
            }

            foreach ($webPush->flush() as $report) {
                if ($report->isSubscriptionExpired()) {
                    WebPushSubscription::where('endpoint', $report->getEndpoint())->delete();
                }
            }
        } catch (\Exception $e) {
            Log::error('Web push failed: ' . $e->getMessage());
        }
    }
}
