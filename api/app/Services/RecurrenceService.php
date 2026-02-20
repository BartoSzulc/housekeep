<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Carbon;
use RRule\RRule;

class RecurrenceService
{
    public function getOccurrences(Task $task, Carbon $from, Carbon $to): array
    {
        if (!$task->is_recurring || !$task->rrule) {
            return $task->due_date ? [$task->due_date] : [];
        }

        $rule = new RRule(array_merge(
            RRule::parseString($task->rrule),
            ['DTSTART' => $task->due_date->toDateTime()]
        ));

        $occurrences = [];
        foreach ($rule as $occurrence) {
            $date = Carbon::instance($occurrence);
            if ($date->gt($to)) break;
            if ($date->gte($from)) {
                $occurrences[] = $date;
            }
        }

        return $occurrences;
    }
}
