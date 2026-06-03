<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Octane-safe atomic counters keyed by an arbitrary scope string (e.g.
        // "submission:{company}:{form}"). The DB row is the source of truth — no static
        // state that would persist unsafely across Octane requests.
        Schema::create('sequences', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->unsignedBigInteger('value')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sequences');
    }
};
