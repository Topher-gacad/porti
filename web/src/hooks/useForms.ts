import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { FormSummary, FormDetail } from '@/types/models'

// The request types the current user may file (resolved for their company).
export function useForms() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: FormSummary[] }>('/forms')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// A single form's renderable schema.
export function useForm(key: string | null) {
  return useQuery({
    queryKey: ['forms', key],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: FormDetail }>(`/forms/${key}`)
      return data.data
    },
    enabled: !!key,
  })
}
