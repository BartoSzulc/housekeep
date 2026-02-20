<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InviteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'household_id' => $this->household_id,
            'email' => $this->email,
            'status' => $this->status,
            'token' => $this->token,
            'expires_at' => $this->expires_at,
            'invited_by' => new UserResource($this->whenLoaded('invitedBy')),
            'created_at' => $this->created_at,
        ];
    }
}
