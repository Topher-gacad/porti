<?php

namespace Tests\Fixtures;

use App\Core\Tenancy\SharedConfig;
use Illuminate\Database\Eloquent\Model;

/**
 * Test-only config model exercising the SharedConfig trait / ConfigVisibilityScope /
 * ConfigResolver seam in isolation, before any real config table (workflows, apps, ...)
 * exists. Its table is created per-test in ConfigVisibilityScopeTest::setUp.
 */
class ConfigFixture extends Model
{
    use SharedConfig;

    protected $table = 'config_fixtures';

    protected $guarded = [];

    public $timestamps = false;
}
