import { handlers } from '@/auth'

// Next.js 16's route analyzer only registers HTTP methods exposed as explicit named
// export bindings; it does NOT extract them from a destructuring pattern. So
// `export const { GET, POST } = handlers` registers zero methods and the route 404s
// (which surfaces as the Auth.js client's "ClientFetchError … Unexpected token '<'").
// Re-export each method as its own binding, matching the working /api/v1 proxy.
export const GET = handlers.GET
export const POST = handlers.POST
