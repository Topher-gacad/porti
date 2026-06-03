<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apps', function (Blueprint $table) {
            $table->id();

            // Config tenancy (NOT record isolation): NULL = global tile available to every
            // company; non-null = that company's subsidiary-specific tile or override.
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            // The global row this tile was cloned from when "Customize for {Company}" runs.
            $table->foreignId('derived_from_id')->nullable()->constrained('apps')->nullOnDelete();

            $table->string('key');                          // stable identifier, e.g. 'erpnext'
            $table->string('kind')->default('external_sso'); // 'native' | 'external_sso'
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('url')->nullable();              // launch target for external_sso tiles
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // One tile per key per scope (NULLs distinct on both MySQL & SQLite — the global
            // single-row invariant is kept by the seeder/admin action, not the index).
            $table->unique(['key', 'company_id']);
            $table->index(['company_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
