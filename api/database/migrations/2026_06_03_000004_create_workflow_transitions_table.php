<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_state_id')->constrained('workflow_states')->cascadeOnDelete();
            $table->foreignId('to_state_id')->constrained('workflow_states')->cascadeOnDelete();

            $table->string('name');   // action label, e.g. "Approve"
            $table->string('slug');   // stable action key

            // Per-transition gating. The gate is ScopedPermissionService::can(actor,
            // required_permission, record.context narrowed to scope_level) + super-admin bypass.
            $table->string('required_permission')->nullable();
            $table->string('scope_level')->nullable();         // department|branch|company|global
            $table->json('allowed_role_names')->nullable();
            $table->boolean('prevent_self')->default(false);
            $table->boolean('requires_comment')->default(false);
            $table->string('condition')->nullable();           // key into the closed ConditionRegistry
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->unique(['workflow_id', 'slug']);
            $table->index(['workflow_id', 'from_state_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_transitions');
    }
};
