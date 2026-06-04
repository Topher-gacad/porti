import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

export type ScopeRef = { id: number; name: string } | null

export type MeRoleAssignment = {
  id: number
  role: string
  scope_type: 'global' | 'company' | 'branch' | 'department'
  scope_id: number | null
}

// Shape of GET /api/v1/me (the current user's own profile — open to any active user).
export type Me = {
  id: number
  name: string
  email: string
  authentik_uid: string | null
  company_id: number | null
  branch_id: number | null
  department_id: number | null
  is_active: boolean
  last_login_at: string | null
  created_at: string | null
  company: ScopeRef
  branch: ScopeRef
  department: ScopeRef
  roles: string[]
  permissions: string[]
  role_assignments: MeRoleAssignment[]
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apiClient.get<Me>('/me')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
