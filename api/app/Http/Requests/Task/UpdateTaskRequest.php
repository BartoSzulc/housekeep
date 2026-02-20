<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'due_time' => ['nullable', 'date_format:H:i'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'is_recurring' => ['boolean'],
            'rrule' => ['nullable', 'string'],
            'priority' => ['integer', 'in:0,1,2,3'],
            'is_completed' => ['boolean'],
            'reminder_minutes_before' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
