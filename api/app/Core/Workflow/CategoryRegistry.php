<?php

namespace App\Core\Workflow;

use InvalidArgumentException;

/**
 * The FIXED status spine per entity_type — a developer-defined primitive, not an admin knob
 * ("states are labels, categories are truth"). UI/SLA/reporting key off the category, never
 * the free-form state name. A workflow may only use categories from its entity_type's spine.
 *
 * Closed by construction: adding an entity_type's spine is a code change (and module SDK
 * step), never runtime data.
 */
class CategoryRegistry
{
    private const SPINES = [
        'submission' => ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
        'ticket' => ['pending', 'in_progress', 'resolved', 'cancelled'],
    ];

    public static function has(string $entityType): bool
    {
        return isset(self::SPINES[$entityType]);
    }

    /**
     * @return list<string>
     */
    public static function for(string $entityType): array
    {
        return self::SPINES[$entityType]
            ?? throw new InvalidArgumentException("No category spine registered for entity_type [{$entityType}].");
    }

    public static function isValid(string $entityType, string $category): bool
    {
        return self::has($entityType) && in_array($category, self::SPINES[$entityType], true);
    }
}
