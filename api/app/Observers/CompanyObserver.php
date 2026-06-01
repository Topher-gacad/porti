<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Company;
use App\Services\AuditLogger;

class CompanyObserver
{
    public function updated(Company $company): void
    {
        $changes = $company->getChanges();
        unset($changes['updated_at']);

        if (!empty($changes)) {
            app(AuditLogger::class)->log(AuditLog::ACTION_COMPANY_UPDATED, $company, ['changes' => $changes]);
        }
    }
}
