<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('version');
            // Frozen graph (states + transitions) at publish time; in-flight records finish
            // on the version pinned at creation, even if the editable workflow changes later.
            $table->json('graph_snapshot');

            // One-active-per-scope is enforced transactionally in the publish service, not by
            // a DB partial index (not portable to the in-memory SQLite test DB).
            $table->boolean('is_active')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique(['workflow_id', 'version']);
            $table->index(['workflow_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_versions');
    }
};
