import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { BranchAccessGrant } from '@/types/models'

type GrantPayload = {
  branch_id: number
  grantee_type: 'user' | 'team'
  grantee_id: number
  reason?: string | null
  valid_until?: string | null
}

export function useBranchAccessGrants(companyId: number) {
  return useQuery({
    queryKey: ['branch-access-grants', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: BranchAccessGrant[] }>(
        `/companies/${companyId}/branch-access-grants`,
      )
      return data.data
    },
    enabled: companyId > 0,
  })
}

export function useCreateBranchAccessGrant(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: GrantPayload) =>
      apiClient.post<{ data: BranchAccessGrant }>(
        `/companies/${companyId}/branch-access-grants`,
        payload,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-access-grants', companyId] }),
  })
}

export function useRevokeBranchAccessGrant(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (grantId: number) =>
      apiClient.delete(`/companies/${companyId}/branch-access-grants/${grantId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-access-grants', companyId] }),
  })
}
