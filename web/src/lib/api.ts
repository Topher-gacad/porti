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

export type UserProfile = {
  id: number
  name: string
  email: string
  company_id: number | null
  branch_id: number | null
  department_id: number | null
  is_active: boolean
  roles: string[]
  permissions: string[]
}

export async function fetchUserProfile(token: string): Promise<UserProfile | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/api/v1/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return null
    return res.json() as Promise<UserProfile>
  } catch {
    return null
  }
}

export async function syncUserToLaravel(
  authentikUser: AuthentikUser,
): Promise<SyncedUser | null> {
  if (!API_URL || !SYNC_SECRET) return null

  try {
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
    return await res.json() as SyncedUser
  } catch {
    return null
  }
}
