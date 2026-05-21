import type { AuthentikUser } from './authentik'

const API_URL = process.env.API_URL
const SYNC_SECRET = process.env.API_SYNC_SECRET

export type SyncedUser = {
  token: string
  user: {
    id: number
    name: string
    email: string
    username: string
    authentik_uid: string
    company_id: number | null
    is_active: boolean
  }
}

export async function syncUserToLaravel(
  authentikUser: AuthentikUser,
): Promise<SyncedUser | null> {
  if (!API_URL || !SYNC_SECRET) {
    throw new Error('API_URL or API_SYNC_SECRET is not configured')
  }

  const res = await fetch(`${API_URL}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Service-Token': SYNC_SECRET,
    },
    body: JSON.stringify({
      authentik_uid: authentikUser.uid,
      email: authentikUser.email,
      name: authentikUser.name,
      username: authentikUser.username,
      avatar: authentikUser.avatar ?? null,
    }),
  })

  if (!res.ok) return null
  return res.json() as Promise<SyncedUser>
}
