<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PriceHistoryResource;
use App\Models\Household;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceHistoryController extends Controller
{
    public function index(Household $household, Product $product): JsonResponse
    {
        $history = $product->priceHistory()->orderByDesc('recorded_at')->get();

        return response()->json([
            'price_history' => PriceHistoryResource::collection($history),
        ]);
    }

    public function store(Request $request, Household $household, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'store' => ['nullable', 'string', 'max:255'],
            'recorded_at' => ['nullable', 'date'],
        ]);

        $entry = $product->priceHistory()->create([
            'price' => $validated['price'],
            'store' => $validated['store'] ?? null,
            'recorded_at' => $validated['recorded_at'] ?? now(),
        ]);

        return response()->json([
            'price_history' => new PriceHistoryResource($entry),
        ], 201);
    }
}
