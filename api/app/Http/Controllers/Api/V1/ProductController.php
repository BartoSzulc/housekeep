<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Household;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request, Household $household): JsonResponse
    {
        $query = $household->products()->whereNull('consumed_at')->with(['location', 'category']);

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('name')->paginate($request->get('per_page', 50));

        return response()->json([
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(StoreProductRequest $request, Household $household): JsonResponse
    {
        $product = $household->products()->create(
            array_merge($request->validated(), ['created_by' => $request->user()->id])
        );

        if ($request->price) {
            $product->priceHistory()->create([
                'price' => $request->price,
                'store' => $request->store ?? null,
                'recorded_at' => now(),
            ]);
        }

        return response()->json([
            'product' => new ProductResource($product->load(['location', 'category'])),
        ], 201);
    }

    public function show(Household $household, Product $product): JsonResponse
    {
        return response()->json([
            'product' => new ProductResource($product->load(['location', 'category', 'priceHistory'])),
        ]);
    }

    public function update(UpdateProductRequest $request, Household $household, Product $product): JsonResponse
    {
        $oldPrice = $product->price;
        $product->update($request->validated());

        if ($request->has('price') && $request->price != $oldPrice && $request->price !== null) {
            $product->priceHistory()->create([
                'price' => $request->price,
                'store' => $request->store ?? null,
                'recorded_at' => now(),
            ]);
        }

        return response()->json([
            'product' => new ProductResource($product->fresh()->load(['location', 'category'])),
        ]);
    }

    public function destroy(Household $household, Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function expiring(Request $request, Household $household): JsonResponse
    {
        $days = (int) $request->get('days', 3);

        $products = $household->products()
            ->whereNull('consumed_at')
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [now(), now()->addDays($days)])
            ->with(['location', 'category'])
            ->orderBy('expiry_date')
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function lowStock(Household $household): JsonResponse
    {
        $products = $household->products()
            ->whereNull('consumed_at')
            ->whereColumn('quantity', '<=', 'min_quantity')
            ->with(['location', 'category'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function restock(Request $request, Household $household, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'store' => ['nullable', 'string', 'max:255'],
        ]);

        $product->update([
            'quantity' => $product->quantity + $validated['quantity'],
            'last_restocked_at' => now(),
            'on_shopping_list' => false,
        ]);

        if (isset($validated['price'])) {
            $product->priceHistory()->create([
                'price' => $validated['price'],
                'store' => $validated['store'] ?? null,
                'recorded_at' => now(),
            ]);
            $product->update(['price' => $validated['price']]);
        }

        return response()->json([
            'product' => new ProductResource($product->fresh()->load(['location', 'category'])),
        ]);
    }

    public function consume(Household $household, Product $product): JsonResponse
    {
        $product->update([
            'consumed_at' => now(),
            'on_shopping_list' => false,
        ]);

        return response()->json([
            'product' => new ProductResource($product->fresh()->load(['location', 'category'])),
        ]);
    }

    public function unconsume(Household $household, Product $product): JsonResponse
    {
        $product->update(['consumed_at' => null]);

        return response()->json([
            'product' => new ProductResource($product->fresh()->load(['location', 'category'])),
        ]);
    }

    public function consumed(Request $request, Household $household): JsonResponse
    {
        $query = $household->products()->whereNotNull('consumed_at')->with(['location', 'category']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderByDesc('consumed_at')->paginate($request->get('per_page', 50));

        return response()->json([
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
