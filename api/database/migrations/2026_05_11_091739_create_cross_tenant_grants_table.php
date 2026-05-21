<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cross_tenant_grants', function (Blueprint $table) {
            $table->id();
            // grantee can be a user or a team
            $table->string('grantee_type');
            $table->unsignedBigInteger('grantee_id');
            $table->foreignId('target_company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('target_branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('target_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamp('valid_from')->useCurrent();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['grantee_type', 'grantee_id']);
            $table->index(['target_company_id', 'target_branch_id', 'target_department_id']);
            $table->index(['valid_until', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cross_tenant_grants');
    }
};
