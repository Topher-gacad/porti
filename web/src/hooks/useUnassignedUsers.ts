import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { Paginated, Single, User } from '@/types/models'

// The Unassigned review queue: JIT-SSO users a login could not resolve to any company
// (company_id IS NULL). Privileged-only on the backend (super-admin/developer).
export function useUnassignedUsers(page = 1) {
  return useQuery({
    queryKey: ['unassigned-users', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<User>>('/users/unassigned', {
        params: { page },
      })
      return data
    },
  })
}

// Assign a company to an unassigned user (reuses the user update endpoint). Refreshes both
// the queue and the general users list so neither shows stale membership.
export function useAssignUserCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, company_id }: { id: number; company_id: number }) =>
      apiClient.patch<Single<User>>(`/users/${id}`, { company_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unassigned-users'] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
