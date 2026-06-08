export type Role = {
  id: number
  name: string
  permissions?: string[]
  is_system?: boolean
  is_locked?: boolean
}

export type ScopeType = 'global' | 'company' | 'branch' | 'department'

export type RoleAssignment = {
  id: number
  role_id: number
  role: string
  scope_type: ScopeType
  scope_id: number | null
  assigned_by?: { id: number; name: string } | null
  created_at: string
}

export type Company = {
  id: number
  name: string
  code: string
  logo: string | null
  is_active: boolean
  enforce_branch_isolation: boolean
  created_at: string
  updated_at: string
}

export type BranchAccessGrant = {
  id: number
  branch: { id: number; name: string } | null
  grantee_type: 'user' | 'team'
  grantee_id: number
  granted_by: { id: number; name: string } | null
  reason: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export type Branch = {
  id: number
  company_id: number
  name: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Department = {
  id: number
  company_id: number
  branch_id: number | null
  name: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Team = {
  id: number
  company_id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type User = {
  id: number
  name: string
  email: string
  authentik_uid: string | null
  company_id: number | null
  branch_id: number | null
  department_id: number | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  roles?: string[]
  role_assignments?: RoleAssignment[]
}

export type AuditLog = {
  id: number
  action: string
  label: string
  target_type: string | null
  target_id: number | null
  payload: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  actor: { id: number; name: string; email: string } | null
}

export type Paginated<T> = {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ── Form / submission engine (Phase 3 runtime) ──────────────────────────────────

export type FormFieldType =
  | 'text' | 'textarea' | 'number' | 'integer' | 'date' | 'datetime' | 'boolean'
  | 'select' | 'multiselect' | 'radio' | 'user' | 'team' | 'file' | 'currency' | 'duration'

export type FormField = {
  key: string
  type: FormFieldType
  label?: string
  required?: boolean
  min?: number
  max?: number
  options?: string[]
}

export type FormSummary = {
  key: string
  name: string
  icon: string | null
  is_global: boolean
}

export type FormDetail = {
  key: string
  name: string
  icon: string | null
  version: number
  workflow_key: string
  field_schema: FormField[]
}

export type TransitionOption = { slug: string; name: string }

export type SubmissionEvent = {
  verb: string
  properties: Record<string, unknown> | null
  actor: { id: number; name: string } | null
  created_at: string | null
}

export type SubmissionSummary = {
  id: number
  number: string
  form_key: string
  form_name: string | null
  state: string | null
  state_category: string | null
  requester_id: number
  created_at: string | null
}

export type SubmissionDetail = SubmissionSummary & {
  data: Record<string, unknown>
  requester: { id: number; name: string } | null
  assignee: { id: number; name: string } | null
  pending_approval: { state_slug: string; status: string } | null
  available_transitions: TransitionOption[]
  timeline: SubmissionEvent[]
}

// The submissions list endpoint returns Laravel's un-wrapped paginator (page fields at the
// top level), unlike the Resource-collection endpoints that nest them under `meta`.
export type LaravelPage<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type Single<T> = {
  data: T
}
