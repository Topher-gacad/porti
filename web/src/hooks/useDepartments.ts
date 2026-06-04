import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { fetchAllPages } from '@/lib/axios'
import type { Department, Paginated, Single } from '@/types/models'

export type DepartmentPayload = {
  name: string
  code: string
  branch_id?: number | null
  is_active?: boolean
}

export function useDepartments(page = 1) {
  return useQuery({
    queryKey: ['departments', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Department>>('/departments', {
        params: { page },
      })
      return data
    },
  })
}

export function useAllDepartments() {
  return useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => fetchAllPages<Department>('/departments'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DepartmentPayload) =>
      apiClient.post<Single<Department>>('/departments', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DepartmentPayload> }) =>
      apiClient.patch<Single<Department>>(`/departments/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  })
}
