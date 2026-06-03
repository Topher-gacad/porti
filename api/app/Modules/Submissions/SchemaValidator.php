<?php

namespace App\Modules\Submissions;

use Illuminate\Support\Facades\Validator;

/**
 * Validates a submission's `data` payload against a (snapshotted) form field_schema, and
 * validates the schema itself is well-formed. Typed values, validated — not EAV.
 */
class SchemaValidator
{
    public function __construct(private readonly FieldTypeRegistry $types) {}

    /**
     * Validate + return the cleaned data for the given schema. Throws ValidationException
     * (422) on failure.
     *
     * @param  list<array>  $fieldSchema
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function validate(array $fieldSchema, array $data): array
    {
        $rules = [];
        $attributes = [];

        foreach ($fieldSchema as $field) {
            $key = $field['key'];
            $rules[$key] = $this->types->rulesFor($field);
            $attributes[$key] = $field['label'] ?? $key;

            if (($field['type'] ?? null) === 'multiselect' && ! empty($field['options'])) {
                $rules[$key.'.*'] = ['string', 'in:'.implode(',', $field['options'])];
            }
        }

        return Validator::make($data, $rules, [], $attributes)->validate();
    }

    /**
     * Structural validation of a schema (used before publishing a form). Returns errors.
     *
     * @param  list<array>  $fieldSchema
     * @return list<string>
     */
    public function schemaErrors(array $fieldSchema): array
    {
        $errors = [];
        $seen = [];

        foreach ($fieldSchema as $i => $field) {
            $key = $field['key'] ?? null;
            if (! is_string($key) || $key === '') {
                $errors[] = "Field #{$i} is missing a key.";

                continue;
            }
            if (isset($seen[$key])) {
                $errors[] = "Duplicate field key [{$key}].";
            }
            $seen[$key] = true;

            $type = $field['type'] ?? null;
            if (! is_string($type) || ! $this->types->isValid($type)) {
                $errors[] = "Field [{$key}] has an unknown type [".(is_string($type) ? $type : 'null').'].';

                continue;
            }

            if (in_array($type, ['select', 'multiselect', 'radio'], true) && empty($field['options'])) {
                $errors[] = "Field [{$key}] of type [{$type}] must declare options.";
            }
        }

        return $errors;
    }
}
