<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();

            $table->string('name');      // free-form label ("states are labels")
            $table->string('slug');      // stable key within the workflow (used in snapshots)
            $table->string('category');  // fixed spine value ("categories are truth")

            $table->boolean('is_initial')->default(false);
            $table->boolean('is_terminal')->default(false);
            $table->boolean('sla_pauses')->default(false);
            $table->boolean('is_approval_gate')->default(false);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->unique(['workflow_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_states');
    }
};
