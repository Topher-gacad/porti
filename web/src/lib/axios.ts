import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

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
