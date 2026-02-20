<?php

namespace App\Models;

use App\Enums\InviteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Invite extends Model
{
    protected $fillable = ['household_id', 'invited_by', 'email', 'status', 'expires_at'];

    protected $casts = [
        'status' => InviteStatus::class,
        'expires_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Invite $invite) {
            $invite->uuid = (string) Str::uuid();
            $invite->token = Str::random(64);
        });
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
