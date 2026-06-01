import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { Branch, Paginated, Single } from '@/types/models'

export type BranchPayload = {
  name: string
  code: string
  is_active?: boolean
}

export function useBranches(page = 1) {
  return useQuery({
    queryKey: ['branches', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Branch>>('/branches', {
        params: { page },
      })
      return data
    },
  })
}

export function useAllBranches() {
  return useQuery({
    queryKey: ['branches', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Branch>>('/branches', {
        params: { per_page: 500 },
      })
      return data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BranchPayload) =>
      apiClient.post<Single<Branch>>('/branches', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useUpdateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BranchPayload> }) =>
      apiClient.patch<Single<Branch>>(`/branches/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useDeleteBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/branches/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  })
}
