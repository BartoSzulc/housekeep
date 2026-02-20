<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_completions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('completed_by')->constrained('users');
            $table->date('occurrence_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['task_id', 'occurrence_date', 'completed_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_completions');
    }
};
