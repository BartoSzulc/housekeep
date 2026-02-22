<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NamedShoppingListController extends Controller
{
    // GET /shopping-lists
    public function index(Household $household): JsonResponse
    {
        $lists = $household->shoppingLists()->withCount('items')->get();

        return response()->json(['lists' => $lists]);
    }

    // POST /shopping-lists
    public function store(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);

        $list = $household->shoppingLists()->create($validated);

        return response()->json(['list' => $list->load('items')], 201);
    }

    // DELETE /shopping-lists/{list}
    public function destroy(Household $household, ShoppingList $shoppingList): JsonResponse
    {
        $shoppingList->delete();

        return response()->json(['message' => 'List deleted.']);
    }

    // GET /shopping-lists/{list}/items
    public function items(Household $household, ShoppingList $shoppingList): JsonResponse
    {
        return response()->json(['items' => $shoppingList->items]);
    }

    // POST /shopping-lists/{list}/items
    public function addItem(Request $request, Household $household, ShoppingList $shoppingList): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['integer', 'min:1'],
        ]);

        $item = $shoppingList->items()->create($validated);

        return response()->json(['item' => $item], 201);
    }

    // PUT /shopping-lists/{list}/items/{item}
    public function toggleItem(Household $household, ShoppingList $shoppingList, ShoppingListItem $item): JsonResponse
    {
        $item->update(['is_checked' => !$item->is_checked]);

        return response()->json(['item' => $item->fresh()]);
    }

    // DELETE /shopping-lists/{list}/items/{item}
    public function removeItem(Household $household, ShoppingList $shoppingList, ShoppingListItem $item): JsonResponse
    {
        $item->delete();

        return response()->json(['message' => 'Item removed.']);
    }
}
