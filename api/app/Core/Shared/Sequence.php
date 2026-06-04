<?php

namespace App\Core\Shared;

use Illuminate\Support\Facades\DB;

/**
 * Octane-safe monotonic counters. The next value is computed and persisted inside a
 * transaction with a row lock, so the DB row — never in-process static state — is the
 * source of truth across concurrent (and long-lived Octane) requests.
 */
class Sequence
{
    public function next(string $key): int
    {
        return DB::transaction(function () use ($key) {
            $row = DB::table('sequences')->where('key', $key)->lockForUpdate()->first();

            if ($row === null) {
                DB::table('sequences')->insert([
                    'key' => $key, 'value' => 1, 'created_at' => now(), 'updated_at' => now(),
                ]);

                return 1;
            }

            $next = (int) $row->value + 1;
            DB::table('sequences')->where('key', $key)->update(['value' => $next, 'updated_at' => now()]);

            return $next;
        });
    }
}
