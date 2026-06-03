<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CONFIG (SharedConfig): a request type = one form_definitions row + one workflows
        // row, authored in an admin transaction — zero new code/tables per type.
        Schema::create('form_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('derived_from_id')->nullable()->constrained('form_definitions')->nullOnDelete();

            $table->string('key');
            $table->string('name');
            $table->string('icon')->nullable();
            // Ordered fields from the closed field-type registry (typed, validated — not EAV).
            $table->json('field_schema');
            $table->string('workflow_key');             // bound workflow slug (entity_type 'submission')
            $table->string('naming_series')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->string('status')->default('draft'); // draft|published

            $table->timestamps();

            $table->unique(['key', 'company_id', 'version']);
            $table->index(['key', 'company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_definitions');
    }
};
