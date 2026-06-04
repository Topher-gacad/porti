import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { fetchAllPages } from '@/lib/axios'
import type { Company, Paginated, Single } from '@/types/models'

export type CompanyPayload = {
  name: string
  code: string
  logo?: string | null
  is_active?: boolean
  enforce_branch_isolation?: boolean
}

export function useCompanies(page = 1) {
  return useQuery({
    queryKey: ['companies', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Company>>('/companies', {
        params: { page },
      })
      return data
    },
  })
}

export function useAllCompanies() {
  return useQuery({
    queryKey: ['companies', 'all'],
    queryFn: () => fetchAllPages<Company>('/companies'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompanyPayload) =>
      apiClient.post<Single<Company>>('/companies', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CompanyPayload> }) =>
      apiClient.patch<Single<Company>>(`/companies/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}
