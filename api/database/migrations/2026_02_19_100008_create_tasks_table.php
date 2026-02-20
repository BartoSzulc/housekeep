<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->time('due_time')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->string('rrule')->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->integer('reminder_minutes_before')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('synced_at')->nullable();

            $table->index(['household_id', 'due_date']);
            $table->index(['household_id', 'assigned_to']);
            $table->index(['household_id', 'is_recurring']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
