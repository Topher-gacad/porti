import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { User, Single } from '@/types/models'

export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: User[] }>(`/teams/${teamId}/members`)
      return data.data
    },
    enabled: teamId > 0,
  })
}

export function useAddTeamMember(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      apiClient.post<Single<User>>(`/teams/${teamId}/members`, { user_id: userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team-members', teamId] }),
  })
}

export function useRemoveTeamMember(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      apiClient.delete(`/teams/${teamId}/members/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team-members', teamId] }),
  })
}
