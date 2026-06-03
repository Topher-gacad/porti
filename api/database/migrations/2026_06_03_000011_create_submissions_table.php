<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ONE shared tenant-data table (BelongsToCompany) for every Tier-1 form. A new
        // request type adds rows here, never a new table — payload is one typed JSON column.
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();

            // Snapshot of the form at creation (definition + the version it was built from).
            $table->foreignId('form_definition_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('form_definition_version');

            $table->string('entity_type')->default('submission');
            $table->string('workflow_key');     // the bound workflow slug
            $table->string('number');           // per-company-per-form series

            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_team_id')->nullable()->constrained('teams')->nullOnDelete();

            $table->string('workflow_state')->nullable();
            $table->string('state_category')->nullable();
            $table->foreignId('workflow_version_id')->nullable()->constrained('workflow_versions')->nullOnDelete();

            $table->json('data');  // typed, validated against the snapshotted field_schema

            $table->timestamps();

            $table->unique(['company_id', 'number']);
            $table->index(['company_id', 'state_category']);
            $table->index('requester_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
