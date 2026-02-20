<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TaskCompletion extends Model
{
    protected $fillable = ['task_id', 'completed_by', 'occurrence_date', 'notes'];

    protected $casts = [
        'occurrence_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (TaskCompletion $completion) {
            $completion->uuid = (string) Str::uuid();
        });
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
