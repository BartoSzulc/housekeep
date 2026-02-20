<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'due_time' => ['nullable', 'date_format:H:i'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'is_recurring' => ['boolean'],
            'rrule' => ['nullable', 'required_if:is_recurring,true', 'string'],
            'priority' => ['integer', 'in:0,1,2,3'],
            'reminder_minutes_before' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
