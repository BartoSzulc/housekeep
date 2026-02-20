<?php

namespace App\Services;

use App\Models\Household;
use App\Models\Product;

class ShoppingListService
{
    public function generateFromExpired(Household $household): int
    {
        return Product::where('household_id', $household->id)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now())
            ->where('on_shopping_list', false)
            ->update(['on_shopping_list' => true]);
    }

    public function generateFromLowStock(Household $household): int
    {
        return Product::where('household_id', $household->id)
            ->whereColumn('quantity', '<=', 'min_quantity')
            ->where('on_shopping_list', false)
            ->update(['on_shopping_list' => true]);
    }

    public function getShoppingList(Household $household)
    {
        return Product::where('household_id', $household->id)
            ->where('on_shopping_list', true)
            ->with(['category', 'location'])
            ->orderBy('category_id')
            ->get();
    }
}
