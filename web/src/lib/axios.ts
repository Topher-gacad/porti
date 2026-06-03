import axios from 'axios'
import type { Paginated } from '@/types/models'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Fetch every page of a paginated endpoint and return the flattened list.
 * Used by the `useAll*` hooks (dropdowns, pickers) so they never silently
 * truncate the tenant's data — a fixed `per_page` cap would drop records.
 */
export async function fetchAllPages<T>(url: string): Promise<T[]> {
  const items: T[] = []
  let page = 1
  let lastPage = 1

  do {
    const { data } = await apiClient.get<Paginated<T>>(url, {
      params: { page, per_page: 100 },
    })
    items.push(...data.data)
    lastPage = data.meta.last_page
    page += 1
  } while (page <= lastPage)

  return items
}

// A 401 from the proxy means the cached Sanctum token is missing or was revoked
// (the backend revokes login tokens on any role change). Without this, the stale
// session would keep producing silent 401s until the JWT expired. Force a fresh
// sign-in so a new token is issued. signOut is imported lazily to keep this module
// safe in non-browser bundles.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const { signOut } = await import('next-auth/react')
      await signOut({ callbackUrl: '/login' })
    }
    return Promise.reject(error)
  },
)

export default apiClient
