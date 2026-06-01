import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { User, Paginated, Single } from '@/types/models'

export type UserPayload = {
  name: string
  email: string
  password?: string | null
  company_id?: number | null
  branch_id?: number | null
  department_id?: number | null
  is_active?: boolean
  roles?: string[]
}

export function useUsers(page = 1) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<User>>('/users', {
        params: { page },
      })
      return data
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserPayload) =>
      apiClient.post<Single<User>>('/users', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) =>
      apiClient.patch<Single<User>>(`/users/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<User>>('/users', {
        params: { per_page: 500 },
      })
      return data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.patch<Single<User>>(`/users/${id}`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
