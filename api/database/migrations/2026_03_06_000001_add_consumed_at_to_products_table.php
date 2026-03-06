<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('consumed_at')->nullable()->after('on_shopping_list');
            $table->index(['household_id', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['household_id', 'consumed_at']);
            $table->dropColumn('consumed_at');
        });
    }
};
