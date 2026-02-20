<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OpenFoodFactsService
{
    private const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
    private const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days
    private const FIELDS = 'product_name,product_name_pl,brands,categories_tags_pl,image_url,quantity';

    public function lookup(string $barcode): ?array
    {
        $cacheKey = "openfoodfacts:{$barcode}";

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::timeout(15)
                ->get(self::BASE_URL . "/{$barcode}.json", [
                    'fields' => self::FIELDS,
                ]);
        } catch (\Exception $e) {
            return null; // Don't cache timeouts
        }

        if (!$response->ok() || $response->json('status') !== 1) {
            Cache::put($cacheKey, null, 60 * 60 * 24); // Cache "not found" for 1 day only
            return null;
        }

        $product = $response->json('product');

        $result = [
            'name' => $product['product_name_pl']
                ?? $product['product_name']
                ?? null,
            'brand' => $product['brands'] ?? null,
            'categories' => $product['categories_tags_pl'] ?? [],
            'image_url' => $product['image_url'] ?? null,
            'quantity_text' => $product['quantity'] ?? null,
        ];

        Cache::put($cacheKey, $result, self::CACHE_TTL); // Cache found products for 30 days

        return $result;
    }
}
