<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Household;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Household $household): JsonResponse
    {
        $locations = $household->locations()
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'locations' => LocationResource::collection($locations),
        ]);
    }

    public function store(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $location = $household->locations()->create($validated);

        return response()->json([
            'location' => new LocationResource($location),
        ], 201);
    }

    public function show(Household $household, Location $location): JsonResponse
    {
        return response()->json([
            'location' => new LocationResource($location->loadCount('products')),
        ]);
    }

    public function update(Request $request, Household $household, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $location->update($validated);

        return response()->json([
            'location' => new LocationResource($location->fresh()),
        ]);
    }

    public function destroy(Household $household, Location $location): JsonResponse
    {
        $location->delete();

        return response()->json(['message' => 'Location deleted.']);
    }
}
