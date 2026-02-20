<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskCompletionResource;
use App\Models\Household;
use App\Models\Task;
use App\Models\TaskCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskCompletionController extends Controller
{
    public function index(Household $household, Task $task): JsonResponse
    {
        $completions = $task->completions()
            ->with('completedBy')
            ->orderByDesc('occurrence_date')
            ->get();

        return response()->json([
            'completions' => TaskCompletionResource::collection($completions),
        ]);
    }

    public function store(Request $request, Household $household, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'occurrence_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $existing = TaskCompletion::where('task_id', $task->id)
            ->where('occurrence_date', $validated['occurrence_date'])
            ->where('completed_by', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already completed for this date.'], 422);
        }

        $completion = $task->completions()->create([
            'completed_by' => $request->user()->id,
            'occurrence_date' => $validated['occurrence_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        if (!$task->is_recurring) {
            $task->update(['is_completed' => true, 'completed_at' => now()]);
        }

        return response()->json([
            'completion' => new TaskCompletionResource($completion->load('completedBy')),
        ], 201);
    }

    public function destroy(Household $household, Task $task, string $date): JsonResponse
    {
        $deleted = TaskCompletion::where('task_id', $task->id)
            ->where('occurrence_date', $date)
            ->delete();

        if (!$task->is_recurring && $deleted) {
            $task->update(['is_completed' => false, 'completed_at' => null]);
        }

        return response()->json(['message' => 'Completion removed.']);
    }
}
