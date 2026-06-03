<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_approvals', function (Blueprint $table) {
            $table->id();

            // The record awaiting/holding the decision (polymorphic kernel Shared table).
            $table->morphs('approvable');

            $table->string('state_slug');                 // the is_approval_gate state
            $table->string('status')->default('pending'); // pending|approved|rejected
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->text('comment')->nullable();

            $table->timestamps();

            $table->index(['approvable_type', 'approvable_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_approvals');
    }
};
