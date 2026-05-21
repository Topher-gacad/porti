<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    public const ACTION_AUTH_SSO_FAILED    = 'auth.sso.failed';
    public const ACTION_AUTH_LOCAL_SUCCESS = 'auth.local.success';
    public const ACTION_AUTH_LOCAL_FAILED  = 'auth.local.failed';

    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'company_id',
        'payload',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload'    => 'array',
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
