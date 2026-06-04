import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import type { PortalApp } from '@/types/models'

// The launcher tiles visible to the current user (global defaults + their company's
// overrides, collapsed server-side to one per key).
export function useApps() {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PortalApp[] }>('/apps')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Resolve a tile's launch URL through the audited broker. The URL is never returned by
// the list endpoint, so every launch flows through this (and is recorded server-side).
export function useLaunchApp() {
  return useMutation({
    mutationFn: async (key: string) => {
      const { data } = await apiClient.get<{ url: string }>(`/launch/${key}`)
      return data.url
    },
  })
}
