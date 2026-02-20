<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseholdResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'invite_code' => $this->invite_code,
            'members' => MemberResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at,
        ];
    }
}
