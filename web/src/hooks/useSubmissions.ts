import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { LaravelPage, SubmissionDetail, SubmissionSummary, Single } from '@/types/models'

export type SubmissionScope = 'mine' | 'inbox'

// "mine" = requests I filed; "inbox" = requests awaiting a decision I'm allowed to make.
export function useSubmissions(scope: SubmissionScope, page = 1) {
  return useQuery({
    queryKey: ['submissions', scope, page],
    queryFn: async () => {
      const { data } = await apiClient.get<LaravelPage<SubmissionSummary>>('/submissions', {
        params: { scope, page },
      })
      return data
    },
  })
}

export function useSubmission(id: number) {
  return useQuery({
    queryKey: ['submissions', 'detail', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Single<SubmissionDetail>>(`/submissions/${id}`)
      return data.data
    },
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { form_key: string; data: Record<string, unknown> }) =>
      apiClient.post<Single<SubmissionDetail>>('/submissions', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions'] }),
  })
}

// Act on a submission through the workflow engine. The engine enforces the full gate and
// returns 403/422 on failure; an optional comment is required by some transitions.
export function useApplyTransition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, slug, comment }: { id: number; slug: string; comment?: string }) =>
      apiClient.post<Single<SubmissionDetail>>(`/submissions/${id}/transitions/${slug}`, { comment }),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['submissions', 'detail', id] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
    },
  })
}
