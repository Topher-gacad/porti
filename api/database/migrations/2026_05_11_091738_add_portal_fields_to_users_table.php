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
        Schema::table('users', function (Blueprint $table) {
            $table->string('authentik_uid')->unique()->nullable()->after('id');
            $table->string('avatar')->nullable()->after('email');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete()->after('avatar');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete()->after('company_id');
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete()->after('branch_id');
            $table->boolean('is_active')->default(true)->after('department_id');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'authentik_uid', 'avatar',
                'company_id', 'branch_id', 'department_id',
                'is_active', 'last_login_at',
            ]);
        });
    }
};
