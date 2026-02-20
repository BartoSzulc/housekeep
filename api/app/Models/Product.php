<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id', 'location_id', 'category_id', 'created_by',
        'name', 'description', 'price', 'quantity', 'min_quantity',
        'expiry_date', 'is_reusable', 'restock_interval_days',
        'last_restocked_at', 'barcode', 'on_shopping_list',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'last_restocked_at' => 'date',
        'price' => 'decimal:2',
        'is_reusable' => 'boolean',
        'on_shopping_list' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            $product->uuid = (string) Str::uuid();
        });
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(ProductPriceHistory::class)->orderByDesc('recorded_at');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function isExpiringSoon(int $days = 3): bool
    {
        return $this->expiry_date
            && $this->expiry_date->isFuture()
            && $this->expiry_date->diffInDays(now()) <= $days;
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_quantity;
    }
}
