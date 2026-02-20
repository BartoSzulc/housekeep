<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('min_quantity')->default(0);
            $table->date('expiry_date')->nullable();
            $table->boolean('is_reusable')->default(false);
            $table->integer('restock_interval_days')->nullable();
            $table->date('last_restocked_at')->nullable();
            $table->string('barcode')->nullable();
            $table->boolean('on_shopping_list')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('synced_at')->nullable();

            $table->index(['household_id', 'expiry_date']);
            $table->index(['household_id', 'location_id']);
            $table->index(['household_id', 'on_shopping_list']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
