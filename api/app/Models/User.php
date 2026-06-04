<?php

namespace App\Models;

use App\Core\Tenancy\BelongsToCompany;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use BelongsToCompany, HasApiTokens, HasFactory, HasRoles, Notifiable;

    // Spatie Permission uses this to lock role/permission lookups to the 'web' guard.
    // Without it, Sanctum's guard changes would cause findByName() to look in the wrong guard.
    protected string $guard_name = 'web';

    protected $fillable = [
        'authentik_uid', 'name', 'email', 'password',
        'avatar', 'company_id', 'branch_id', 'department_id',
        'is_active', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            // Cast tenant FKs to int so strict comparisons (scopes/policies) hold under
            // MySQL/MariaDB, where PDO returns these columns as strings (not just SQLite).
            'company_id' => 'integer',
            'branch_id' => 'integer',
            'department_id' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function roleAssignments(): HasMany
    {
        return $this->hasMany(UserRoleAssignment::class);
    }

    public function teams(): BelongsToMany
    {
        // team_members has created_at only (DB default); no updated_at column exists,
        // so withTimestamps() would break attach().
        return $this->belongsToMany(Team::class, 'team_members');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Revoke any prior 'login' token and issue a fresh one, applying the configured
     * expiry (portal.token_expiration_minutes; 0 = no expiry). Centralises the logic
     * shared by the SSO sync and local-auth login paths.
     */
    public function issueLoginToken(): string
    {
        $this->tokens()->where('name', 'login')->delete();

        $minutes = (int) config('portal.token_expiration_minutes');
        $expiresAt = $minutes > 0 ? now()->addMinutes($minutes) : null;

        return $this->createToken('login', ['*'], $expiresAt)->plainTextToken;
    }

    /**
     * Rebuild the Spatie flat-role model from the union of ALL scoped role
     * assignments. hasAnyRole()/getRoleNames()/->can() (used by BasePolicy::before,
     * CompanyScope, AdminOnly and the guards) read the flat model, so it must mirror
     * the user_role_assignments table — never a single scope's subset.
     */
    public function syncFlatRolesFromAssignments(): void
    {
        $names = $this->roleAssignments()
            ->with('role:id,name')
            ->get()
            ->pluck('role.name')
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $this->syncRoles($names);
    }
}
