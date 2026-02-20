<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'created_by'];

    protected static function booted(): void
    {
        static::creating(function (Household $household) {
            $household->uuid = (string) Str::uuid();
            $household->invite_code = strtoupper(Str::random(8));
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'household_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function invites(): HasMany
    {
        return $this->hasMany(Invite::class);
    }
}
