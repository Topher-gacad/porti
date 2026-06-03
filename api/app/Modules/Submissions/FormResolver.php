<?php

namespace App\Modules\Submissions;

use App\Core\Tenancy\ConfigResolver;
use Illuminate\Database\Eloquent\Builder;

/**
 * Resolves which published form applies to a record: key → company tier
 * (specific-else-global) → latest published version. Keys off the record's company via
 * ConfigResolver (scope-OFF), never the acting user's visibility. A company form with no
 * published version falls back to the global default.
 */
class FormResolver
{
    public function __construct(private readonly ConfigResolver $configResolver) {}

    public function resolve(string $key, ?int $companyId): ?FormDefinition
    {
        /** @var FormDefinition|null $form */
        $form = $this->configResolver->resolve(
            FormDefinition::class,
            ['key' => $key],
            $companyId,
            fn (Builder $q) => $q
                ->where('status', FormDefinition::STATUS_PUBLISHED)
                ->orderByDesc('version'),
        );

        return $form;
    }
}
