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

export type PortalApp = {
  id: number
  key: string
  kind: 'native' | 'external_sso'
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_global: boolean
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

export type Single<T> = {
  data: T
}
