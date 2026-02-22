<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('nutriscore_grade', 1)->nullable()->after('image_url');
            $table->json('allergens')->nullable()->after('nutriscore_grade');
            $table->text('ingredients')->nullable()->after('allergens');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['nutriscore_grade', 'allergens', 'ingredients']);
        });
    }
};
