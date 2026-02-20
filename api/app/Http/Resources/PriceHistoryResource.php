<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'product_id' => $this->product_id,
            'price' => $this->price,
            'store' => $this->store,
            'recorded_at' => $this->recorded_at->toDateString(),
            'created_at' => $this->created_at,
        ];
    }
}
