<?php

namespace App\Jobs;

use App\Models\Task;
use App\Services\PushNotificationService;
use App\Services\RecurrenceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class SendTaskReminders implements ShouldQueue
{
    use Queueable;

    public function handle(PushNotificationService $pushService, RecurrenceService $recurrenceService): void
    {
        $tasks = Task::query()
            ->where('is_completed', false)
            ->whereNotNull('reminder_minutes_before')
            ->whereNotNull('due_date')
            ->with(['assignedTo', 'household.members'])
            ->get();

        foreach ($tasks as $task) {
            $dueDateTime = Carbon::parse($task->due_date->format('Y-m-d') . ' ' . ($task->due_time ?? '09:00:00'));
            $reminderTime = $dueDateTime->copy()->subMinutes($task->reminder_minutes_before);

            if (!now()->between($reminderTime, $reminderTime->copy()->addMinutes(15))) {
                continue;
            }

            $userIds = [];
            if ($task->assignedTo) {
                $userIds = [$task->assigned_to];
            } else {
                $userIds = $task->household->members->pluck('id')->toArray();
            }

            if (empty($userIds)) continue;

            $pushService->sendToUsers($userIds, [
                'title' => 'Przypomnienie o zadaniu',
                'body' => "\"{$task->title}\" — czas na wykonanie!",
                'data' => [
                    'type' => 'task_reminder',
                    'task_uuid' => $task->uuid,
                    'household_id' => $task->household_id,
                ],
            ]);
        }
    }
}
