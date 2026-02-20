<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id', 'created_by', 'assigned_to',
        'title', 'description', 'due_date', 'due_time',
        'is_recurring', 'rrule', 'priority',
        'is_completed', 'completed_at', 'reminder_minutes_before',
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_recurring' => 'boolean',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            $task->uuid = (string) Str::uuid();
        });
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function completions(): HasMany
    {
        return $this->hasMany(TaskCompletion::class);
    }

    public function isCompletedForDate(Carbon $date): bool
    {
        return $this->completions()
            ->where('occurrence_date', $date->toDateString())
            ->exists();
    }
}
