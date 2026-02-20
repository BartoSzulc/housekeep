<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\Household;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Household $household): JsonResponse
    {
        $categories = $household->categories()
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category = $household->categories()->create($validated);

        return response()->json([
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function show(Household $household, Category $category): JsonResponse
    {
        return response()->json([
            'category' => new CategoryResource($category->loadCount('products')),
        ]);
    }

    public function update(Request $request, Household $household, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category->update($validated);

        return response()->json([
            'category' => new CategoryResource($category->fresh()),
        ]);
    }

    public function destroy(Household $household, Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
