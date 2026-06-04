import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { fetchAllPages } from '@/lib/axios'
import type { Team, Paginated, Single } from '@/types/models'

export type TeamPayload = {
  name: string
  description?: string | null
  is_active?: boolean
}

export function useTeams(page = 1) {
  return useQuery({
    queryKey: ['teams', page],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Team>>('/teams', {
        params: { page },
      })
      return data
    },
  })
}

export function useAllTeams() {
  return useQuery({
    queryKey: ['teams', 'all'],
    queryFn: () => fetchAllPages<Team>('/teams'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamPayload) =>
      apiClient.post<Single<Team>>('/teams', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useUpdateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TeamPayload> }) =>
      apiClient.patch<Single<Team>>(`/teams/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}
