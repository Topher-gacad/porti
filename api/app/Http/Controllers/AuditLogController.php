<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $actor        = $request->user();
        $isSuperAdmin = $actor->hasAnyRole(['super-admin', 'developer']);

        if (!$isSuperAdmin) {
            // Require manage-users or manage-company to view logs
            $sps = app(\App\Services\ScopedPermissionService::class);
            if (!$sps->can($actor, 'manage-users', ['company_id' => $actor->company_id])
                && !$sps->can($actor, 'manage-company', ['company_id' => $actor->company_id])) {
                abort(403);
            }
        }

        $query = AuditLog::with('user:id,name,email')->latest('created_at');

        // Regular admins see only their own company's logs
        if (!$isSuperAdmin) {
            $query->where('company_id', $actor->company_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->input('target_type'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->input('to'));
        }

        return AuditLogResource::collection($query->paginate(50));
    }
}
