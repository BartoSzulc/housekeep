<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarcodeController extends Controller
{
    public function __construct(
        private OpenFoodFactsService $openFoodFactsService,
    ) {}

    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'barcode' => ['required', 'string', 'max:255'],
        ]);

        $result = $this->openFoodFactsService->lookup($request->barcode);

        if (!$result || !$result['name']) {
            return response()->json([
                'found' => false,
                'message' => 'Produkt nie znaleziony w bazie OpenFoodFacts.',
            ]);
        }

        return response()->json([
            'found' => true,
            'product' => $result,
        ]);
    }
}
