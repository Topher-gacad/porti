import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { Role } from '@/types/models'

type RolesResponse       = { data: Role[] }
type PermissionsResponse = { data: string[] }

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await apiClient.get<RolesResponse>('/roles')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await apiClient.get<PermissionsResponse>('/permissions')
      return data.data
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; permissions: string[] }) =>
      apiClient.post<{ data: Role }>('/roles', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name?: string; permissions?: string[] } }) =>
      apiClient.patch<{ data: Role }>(`/roles/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })
}
