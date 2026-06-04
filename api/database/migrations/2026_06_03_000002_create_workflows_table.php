<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();

            // Config tenancy (SharedConfig): NULL = global default, non-null = a company's
            // clone/override. Children (states/transitions/versions) inherit this company.
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('derived_from_id')->nullable()->constrained('workflows')->nullOnDelete();

            $table->string('entity_type');  // logical record type, e.g. 'submission', 'ticket'
            $table->string('slug');         // the workflow_key within an entity_type
            $table->string('name');

            $table->timestamps();

            // Many workflows per entity_type, one per (entity_type, company, slug).
            $table->unique(['entity_type', 'company_id', 'slug']);
            $table->index(['entity_type', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};
