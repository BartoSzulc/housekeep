<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Household;
use App\Models\Product;
use App\Services\ShoppingListService;
use Illuminate\Http\JsonResponse;

class ShoppingListController extends Controller
{
    public function __construct(
        private ShoppingListService $shoppingListService,
    ) {}

    public function index(Household $household): JsonResponse
    {
        $products = $this->shoppingListService->getShoppingList($household);

        return response()->json([
            'shopping_list' => ProductResource::collection($products),
        ]);
    }

    public function generate(Household $household): JsonResponse
    {
        $expiredCount = $this->shoppingListService->generateFromExpired($household);
        $lowStockCount = $this->shoppingListService->generateFromLowStock($household);

        return response()->json([
            'message' => "Added {$expiredCount} expired and {$lowStockCount} low-stock items to shopping list.",
            'added_count' => $expiredCount + $lowStockCount,
        ]);
    }

    public function toggle(Household $household, Product $product): JsonResponse
    {
        $product->update(['on_shopping_list' => !$product->on_shopping_list]);

        return response()->json([
            'product' => new ProductResource($product->fresh()),
        ]);
    }
}
