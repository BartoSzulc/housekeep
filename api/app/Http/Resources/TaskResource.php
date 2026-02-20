<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'household_id' => $this->household_id,
            'created_by' => $this->created_by,
            'assigned_to' => $this->assigned_to,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date?->toDateString(),
            'due_time' => $this->due_time,
            'is_recurring' => $this->is_recurring,
            'rrule' => $this->rrule,
            'priority' => $this->priority,
            'is_completed' => $this->is_completed,
            'completed_at' => $this->completed_at,
            'reminder_minutes_before' => $this->reminder_minutes_before,
            'assigned_user' => new UserResource($this->whenLoaded('assignedTo')),
            'completions' => TaskCompletionResource::collection($this->whenLoaded('completions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
