<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ShoppingList extends Model
{
    protected $fillable = ['household_id', 'name'];

    protected static function booted(): void
    {
        static::creating(function (ShoppingList $list) {
            $list->uuid = (string) Str::uuid();
        });
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShoppingListItem::class)->orderBy('is_checked')->orderBy('name');
    }
}
