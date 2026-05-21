const API_URL    = process.env.API_URL
const SYNC_SECRET = process.env.API_SYNC_SECRET

export type LocalAuthResult = {
  token: string
  user: {
    id: number
    name: string
    email: string
    authentik_uid: string | null
    company_id: number | null
    is_active: boolean
  }
}

export async function authenticateLocally(
  email: string,
  password: string,
): Promise<LocalAuthResult | null> {
  if (!API_URL || !SYNC_SECRET) {
    throw new Error('API_URL or API_SYNC_SECRET is not configured')
  }

  const res = await fetch(`${API_URL}/api/v1/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Service-Token': SYNC_SECRET,
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) return null
  return res.json() as Promise<LocalAuthResult>
}
