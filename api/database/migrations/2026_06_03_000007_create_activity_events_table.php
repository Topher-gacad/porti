<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kernel Shared user-facing timeline. Distinct from audit_logs (compliance): every
        // workflow transition writes BOTH. Append-only — created_at only, no updated_at.
        Schema::create('activity_events', function (Blueprint $table) {
            $table->id();
            $table->morphs('subject');
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('verb');             // e.g. 'workflow.transitioned'
            $table->json('properties')->nullable();
            $table->timestamp('created_at')->nullable();
            // morphs('subject') already indexes (subject_type, subject_id).
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_events');
    }
};
