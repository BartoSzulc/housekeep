<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['household_id', 'name', 'icon', 'sort_order'];

    protected static function booted(): void
    {
        static::creating(function (Location $location) {
            $location->uuid = (string) Str::uuid();
        });
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
