<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-config change ledger (publish/activate/deactivate of a workflow or other config
        // row). Polymorphic so it serves every SharedConfig surface; append-only.
        Schema::create('config_revisions', function (Blueprint $table) {
            $table->id();
            $table->morphs('configurable');
            $table->string('action');                 // published|activated|deactivated
            $table->unsignedInteger('version')->nullable();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->nullable();
            // morphs('configurable') already indexes (configurable_type, configurable_id).
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('config_revisions');
    }
};
