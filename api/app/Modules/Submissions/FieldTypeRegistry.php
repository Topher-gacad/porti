<?php

namespace App\Modules\Submissions;

use InvalidArgumentException;

/**
 * The CLOSED field-type registry for form schemas. A field's payload is a typed JSON value
 * validated against these rules (not EAV). Adding a type is a code change, never admin data.
 *
 * Each entry maps a field definition to a list of Laravel validation rules; required/min/max
 * and select options are layered on per field.
 */
class FieldTypeRegistry
{
    public const TYPES = [
        'text', 'textarea', 'number', 'integer', 'date', 'datetime', 'boolean',
        'select', 'multiselect', 'radio', 'user', 'team', 'file', 'currency', 'duration',
    ];

    private const NUMERIC_TYPES = ['number', 'integer', 'currency', 'duration'];

    public function isValid(string $type): bool
    {
        return in_array($type, self::TYPES, true);
    }

    /**
     * Build the validation rules for a single field definition.
     *
     * @param  array{type?: string, required?: bool, min?: int|float, max?: int|float, options?: list<string>}  $field
     * @return list<string>
     */
    public function rulesFor(array $field): array
    {
        $type = $field['type'] ?? 'text';

        if (! $this->isValid($type)) {
            throw new InvalidArgumentException("Unknown field type [{$type}].");
        }

        $rules = [empty($field['required']) ? 'nullable' : 'required'];

        foreach ($this->typeRules($type, $field) as $rule) {
            $rules[] = $rule;
        }

        if (in_array($type, self::NUMERIC_TYPES, true)) {
            if (isset($field['min'])) {
                $rules[] = 'min:'.$field['min'];
            }
            if (isset($field['max'])) {
                $rules[] = 'max:'.$field['max'];
            }
        }

        return $rules;
    }

    /**
     * @return list<string>
     */
    private function typeRules(string $type, array $field): array
    {
        $options = $field['options'] ?? [];

        return match ($type) {
            'text', 'textarea', 'file' => ['string'],
            'number', 'currency' => ['numeric'],
            'integer', 'duration' => ['integer'],
            'date' => ['date_format:Y-m-d'],
            'datetime' => ['date'],
            'boolean' => ['boolean'],
            'select', 'radio' => $options ? ['string', 'in:'.implode(',', $options)] : ['string'],
            'multiselect' => ['array'],
            'user' => ['integer', 'exists:users,id'],
            'team' => ['integer', 'exists:teams,id'],
            default => ['string'],
        };
    }
}
