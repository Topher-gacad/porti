const AUTHENTIK_URL = process.env.AUTHENTIK_URL
const FLOW_SLUG = process.env.AUTHENTIK_FLOW_SLUG ?? 'default-authentication-flow'

type FlowResponse = {
  type: 'native' | 'redirect' | 'shell'
  component?: string
  to?: string
  field_errors?: Record<string, string[]>
  non_field_errors?: string[]
}

export type AuthentikUser = {
  pk: number
  username: string
  name: string
  email: string
  avatar: string
  uid: string
  is_active: boolean
}

function parseSetCookies(headers: Headers): Record<string, string> {
  const jar: Record<string, string> = {}
  const rawHeaders =
    typeof (headers as any).getSetCookie === 'function'
      ? (headers as any).getSetCookie()
      : [headers.get('set-cookie') ?? ''].filter(Boolean)

  for (const header of rawHeaders as string[]) {
    const [pair] = header.split(';')
    const eq = pair.indexOf('=')
    if (eq > 0) jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim()
  }
  return jar
}

function cookieHeader(jar: Record<string, string>): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

export async function authenticateWithAuthentik(
  username: string,
  password: string,
): Promise<AuthentikUser | null> {
  if (!AUTHENTIK_URL) throw new Error('AUTHENTIK_URL is not configured')

  const url = `${AUTHENTIK_URL}/api/v3/flows/executor/${FLOW_SLUG}/`
  const jar: Record<string, string> = {}

  // Step 1: Initialize flow — collect session + CSRF cookies
  const initRes = await fetch(url, {
    headers: { Accept: 'application/json' },
    redirect: 'manual',
  })
  if (!initRes.ok) return null
  Object.assign(jar, parseSetCookies(initRes.headers))

  // Step 2: Submit username (identification stage)
  const identRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Cookie: cookieHeader(jar),
      'X-authentik-csrf-token': jar.authentik_csrf ?? '',
    },
    body: JSON.stringify({ component: 'ak-stage-identification', uid_field: username }),
    redirect: 'manual',
  })
  if (!identRes.ok) return null
  Object.assign(jar, parseSetCookies(identRes.headers))

  const identData: FlowResponse = await identRes.json()
  if (identData.component !== 'ak-stage-password') return null

  // Step 3: Submit password
  const pwRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Cookie: cookieHeader(jar),
      'X-authentik-csrf-token': jar.authentik_csrf ?? '',
    },
    body: JSON.stringify({ component: 'ak-stage-password', password }),
    redirect: 'manual',
  })
  if (!pwRes.ok) return null
  Object.assign(jar, parseSetCookies(pwRes.headers))

  const pwData: FlowResponse = await pwRes.json()
  if (pwData.type !== 'redirect') return null

  // Step 4: Fetch user info using the established Authentik session
  const meRes = await fetch(`${AUTHENTIK_URL}/api/v3/core/users/me/`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader(jar),
    },
  })
  if (!meRes.ok) return null

  return meRes.json() as Promise<AuthentikUser>
}
