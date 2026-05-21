<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Models\Role;

class UserRoleAssignment extends Model
{
    protected $fillable = [
        'user_id', 'role_id',
        'scope_type', 'scope_id',
        'assigned_by',
    ];

    public const SCOPE_GLOBAL     = 'global';
    public const SCOPE_COMPANY    = 'company';
    public const SCOPE_BRANCH     = 'branch';
    public const SCOPE_DEPARTMENT = 'department';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
