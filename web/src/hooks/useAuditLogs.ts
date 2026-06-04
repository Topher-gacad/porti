import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { AuditLog, Paginated } from '@/types/models'

export type AuditLogFilters = {
  page?: number
  action?: string
  user_id?: number | null
  target_type?: string
  from?: string
  to?: string
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { page = 1, ...rest } = filters

  const params: Record<string, string | number> = { page }
  if (rest.action)      params.action      = rest.action
  if (rest.user_id)     params.user_id     = rest.user_id
  if (rest.target_type) params.target_type = rest.target_type
  if (rest.from)        params.from        = rest.from
  if (rest.to)          params.to          = rest.to

  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<AuditLog>>('/audit-logs', { params })
      return data
    },
  })
}
