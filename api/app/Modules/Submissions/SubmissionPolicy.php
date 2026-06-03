<?php

namespace App\Modules\Submissions;

use App\Models\User;
use App\Policies\BasePolicy;

/**
 * Authorisation for the submission runtime. Tenancy is already enforced by CompanyScope
 * (a user can only resolve submissions in their allowed companies); this governs who may
 * see/act on a given record within that boundary. BasePolicy::before() grants
 * super-admin/developer. Per-transition gating is enforced by the WorkflowEngine.
 */
class SubmissionPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return true; // the controller narrows to "mine" / "inbox"; CompanyScope bounds it
    }

    public function view(User $user, Submission $submission): bool
    {
        if ((int) $submission->requester_id === (int) $user->id) {
            return true;
        }

        if ($submission->assignee_id !== null && (int) $submission->assignee_id === (int) $user->id) {
            return true;
        }

        // Anyone who could approve this submission's company may read it.
        return $this->scopedCanAny($user, ['submissions.approve'], ['company_id' => $submission->company_id]);
    }

    public function create(User $user): bool
    {
        // A submission must belong to a company; unassigned users cannot file one.
        return $user->company_id !== null;
    }
}
