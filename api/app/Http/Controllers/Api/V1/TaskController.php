<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Household;
use App\Models\Task;
use App\Services\RecurrenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    public function __construct(
        private RecurrenceService $recurrenceService,
    ) {}

    public function index(Request $request, Household $household): JsonResponse
    {
        $query = $household->tasks()->with(['assignedTo', 'completions']);

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('is_completed')) {
            $query->where('is_completed', filter_var($request->is_completed, FILTER_VALIDATE_BOOLEAN));
        }

        $tasks = $query->orderBy('due_date')->orderBy('priority', 'desc')->get();

        return response()->json([
            'tasks' => TaskResource::collection($tasks),
        ]);
    }

    public function store(StoreTaskRequest $request, Household $household): JsonResponse
    {
        $task = $household->tasks()->create(
            array_merge($request->validated(), ['created_by' => $request->user()->id])
        );

        return response()->json([
            'task' => new TaskResource($task->load('assignedTo')),
        ], 201);
    }

    public function show(Household $household, Task $task): JsonResponse
    {
        return response()->json([
            'task' => new TaskResource($task->load(['assignedTo', 'completions.completedBy'])),
        ]);
    }

    public function update(UpdateTaskRequest $request, Household $household, Task $task): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['is_completed']) && $data['is_completed'] && !$task->is_completed) {
            $data['completed_at'] = now();
        } elseif (isset($data['is_completed']) && !$data['is_completed']) {
            $data['completed_at'] = null;
        }

        $task->update($data);

        return response()->json([
            'task' => new TaskResource($task->fresh()->load('assignedTo')),
        ]);
    }

    public function destroy(Household $household, Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    public function calendar(Household $household, int $year, int $month): JsonResponse
    {
        $from = Carbon::create($year, $month, 1)->startOfMonth();
        $to = $from->copy()->endOfMonth();

        $tasks = $household->tasks()
            ->with(['assignedTo', 'completions'])
            ->get();

        $calendarItems = [];

        foreach ($tasks as $task) {
            if ($task->is_recurring && $task->rrule && $task->due_date) {
                $occurrences = $this->recurrenceService->getOccurrences($task, $from, $to);
                foreach ($occurrences as $date) {
                    $calendarItems[] = [
                        'task' => new TaskResource($task),
                        'occurrence_date' => $date->toDateString(),
                        'is_completed' => $task->isCompletedForDate($date),
                    ];
                }
            } elseif ($task->due_date && $task->due_date->between($from, $to)) {
                $calendarItems[] = [
                    'task' => new TaskResource($task),
                    'occurrence_date' => $task->due_date->toDateString(),
                    'is_completed' => $task->is_completed,
                ];
            }
        }

        usort($calendarItems, fn ($a, $b) => strcmp($a['occurrence_date'], $b['occurrence_date']));

        return response()->json([
            'calendar' => $calendarItems,
            'year' => $year,
            'month' => $month,
        ]);
    }
}
