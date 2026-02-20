<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ProductPriceHistory extends Model
{
    protected $fillable = ['product_id', 'price', 'store', 'recorded_at'];

    protected $casts = [
        'price' => 'decimal:2',
        'recorded_at' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (ProductPriceHistory $history) {
            $history->uuid = (string) Str::uuid();
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
