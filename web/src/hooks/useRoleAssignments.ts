import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { RoleAssignment, ScopeType } from '@/types/models'

export type RoleAssignmentPayload = {
  role_id: number
  scope_type: ScopeType
  scope_id?: number | null
}

export function useRoleAssignments(userId: number) {
  return useQuery({
    queryKey: ['role-assignments', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: RoleAssignment[] }>(
        `/users/${userId}/role-assignments`,
      )
      return data.data
    },
    enabled: userId > 0,
  })
}

export function useCreateRoleAssignment(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RoleAssignmentPayload) =>
      apiClient.post<{ data: RoleAssignment }>(
        `/users/${userId}/role-assignments`,
        payload,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-assignments', userId] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteRoleAssignment(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: number) =>
      apiClient.delete(`/users/${userId}/role-assignments/${assignmentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-assignments', userId] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
