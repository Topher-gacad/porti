<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'code', 'logo', 'is_active', 'enforce_branch_isolation'];

    protected $casts = [
        'is_active'                 => 'boolean',
        'enforce_branch_isolation'  => 'boolean',
    ];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function branchAccessGrants(): HasMany
    {
        return $this->hasMany(BranchAccessGrant::class);
    }
}
