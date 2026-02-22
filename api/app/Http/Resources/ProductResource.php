<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'household_id' => $this->household_id,
            'location_id' => $this->location_id,
            'category_id' => $this->category_id,
            'created_by' => $this->created_by,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'min_quantity' => $this->min_quantity,
            'expiry_date' => $this->expiry_date?->toDateString(),
            'is_reusable' => $this->is_reusable,
            'restock_interval_days' => $this->restock_interval_days,
            'last_restocked_at' => $this->last_restocked_at?->toDateString(),
            'barcode' => $this->barcode,
            'image_url' => $this->image_url,
            'nutriscore_grade' => $this->nutriscore_grade,
            'allergens' => $this->allergens ?? [],
            'ingredients' => $this->ingredients,
            'on_shopping_list' => $this->on_shopping_list,
            'is_expired' => $this->isExpired(),
            'is_expiring_soon' => $this->isExpiringSoon(),
            'is_low_stock' => $this->isLowStock(),
            'location' => new LocationResource($this->whenLoaded('location')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
