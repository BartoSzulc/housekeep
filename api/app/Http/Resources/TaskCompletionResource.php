<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskCompletionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'task_id' => $this->task_id,
            'completed_by' => $this->completed_by,
            'occurrence_date' => $this->occurrence_date->toDateString(),
            'notes' => $this->notes,
            'user' => new UserResource($this->whenLoaded('completedBy')),
            'created_at' => $this->created_at,
        ];
    }
}
