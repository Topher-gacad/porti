<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    public const ACTION_AUTH_SSO_FAILED = 'auth.sso.failed';

    public const ACTION_AUTH_LOCAL_SUCCESS = 'auth.local.success';

    public const ACTION_AUTH_LOCAL_FAILED = 'auth.local.failed';

    public const ACTION_USER_CREATED = 'user.created';

    public const ACTION_USER_UPDATED = 'user.updated';

    public const ACTION_USER_DELETED = 'user.deleted';

    public const ACTION_BRANCH_CREATED = 'branch.created';

    public const ACTION_BRANCH_UPDATED = 'branch.updated';

    public const ACTION_BRANCH_DELETED = 'branch.deleted';

    public const ACTION_DEPT_CREATED = 'department.created';

    public const ACTION_DEPT_UPDATED = 'department.updated';

    public const ACTION_DEPT_DELETED = 'department.deleted';

    public const ACTION_TEAM_CREATED = 'team.created';

    public const ACTION_TEAM_UPDATED = 'team.updated';

    public const ACTION_TEAM_DELETED = 'team.deleted';

    public const ACTION_COMPANY_UPDATED = 'company.updated';

    public const ACTION_ROLE_ASSIGNED = 'role.assigned';

    public const ACTION_ROLE_REVOKED = 'role.revoked';

    public const ACTION_MEMBER_ADDED = 'team.member.added';

    public const ACTION_MEMBER_REMOVED = 'team.member.removed';

    public const ACTION_BRANCH_GRANT_CREATED = 'branch.access.granted';

    public const ACTION_BRANCH_GRANT_REVOKED = 'branch.access.revoked';

    public const ACTION_BRANCH_ISOLATION_ON = 'company.branch_isolation.enabled';

    public const ACTION_BRANCH_ISOLATION_OFF = 'company.branch_isolation.disabled';

    public const ACTION_ROLE_CREATED = 'role.created';

    public const ACTION_ROLE_UPDATED = 'role.updated';

    public const ACTION_ROLE_DELETED = 'role.deleted';

    public const ACTION_BRANCH_RESTORED = 'branch.restored';

    public const ACTION_BRANCH_FORCE_DELETED = 'branch.force_deleted';

    public const ACTION_DEPT_RESTORED = 'department.restored';

    public const ACTION_DEPT_FORCE_DELETED = 'department.force_deleted';

    public const ACTION_TEAM_RESTORED = 'team.restored';

    public const ACTION_TEAM_FORCE_DELETED = 'team.force_deleted';

    public const ACTION_APP_LAUNCHED = 'app.launched';

    public const ACTION_CROSS_GRANT_CREATED = 'cross_tenant.granted';

    public const ACTION_CROSS_GRANT_REVOKED = 'cross_tenant.revoked';

    public const ACTION_USER_LINKED_SSO = 'user.sso.linked';

    public const ACTION_USER_UNASSIGNED = 'user.unassigned';

    public const ACTION_USER_COMPANY_CHANGED = 'user.company.changed';

    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'company_id',
        'payload',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
