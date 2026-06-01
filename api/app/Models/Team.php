<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use BelongsToCompany, SoftDeletes;

    protected $fillable = ['company_id', 'name', 'description', 'is_active'];

    protected $casts = ['company_id' => 'integer', 'is_active' => 'boolean'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function members(): BelongsToMany
    {
        // team_members has created_at only (DB default); no updated_at column exists,
        // so withTimestamps() would break attach().
        return $this->belongsToMany(User::class, 'team_members');
    }
}
