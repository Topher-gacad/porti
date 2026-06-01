import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL ?? 'http://localhost:8001'

type Context = { params: Promise<{ path: string[] }> }

async function proxy(req: NextRequest, { params }: Context): Promise<NextResponse> {
  const session = await auth()

  if (!session?.apiToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await params

  // Block path traversal: a '..'/'.' segment would let new URL() resolve outside
  // /api/v1 and forward the user's Sanctum token to an arbitrary upstream route.
  if (path.some((seg) => seg === '..' || seg === '.')) {
    return NextResponse.json({ message: 'Invalid path' }, { status: 400 })
  }

  // Encode each segment so embedded separators/control chars can't create new
  // path segments, then assert we never escaped the /api/v1 prefix.
  const safePath = path.map(encodeURIComponent).join('/')
  const targetUrl = new URL(`/api/v1/${safePath}`, API_URL)

  if (targetUrl.pathname !== '/api/v1' && !targetUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.json({ message: 'Invalid path' }, { status: 400 })
  }

  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${session.apiToken}`,
    },
    body,
  })

  // 204/205/304 are null-body statuses — Response constructor rejects a body with these codes
  if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
    return new NextResponse(null, { status: upstream.status })
  }

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
    },
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
