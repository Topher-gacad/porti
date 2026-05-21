import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authenticateWithAuthentik } from '@/lib/authentik'
import { syncUserToLaravel } from '@/lib/api'
import { authenticateLocally } from '@/lib/local-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'sso',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        // Step 1: verify credentials against Authentik
        const authentikUser = await authenticateWithAuthentik(
          credentials.username as string,
          credentials.password as string,
        )
        if (!authentikUser || !authentikUser.is_active) return null

        // Step 2: sync to Laravel and obtain a Sanctum token
        const synced = await syncUserToLaravel(authentikUser)
        if (!synced) return null

        return {
          id: authentikUser.uid,
          name: authentikUser.name,
          email: authentikUser.email,
          image: authentikUser.avatar || null,
          authentikUid: authentikUser.uid,
          username: authentikUser.username,
          apiToken: synced.token,
        }
      },
    }),

    Credentials({
      id: 'local',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await authenticateLocally(
          credentials.email as string,
          credentials.password as string,
        )
        if (!result) return null

        return {
          id: String(result.user.id),
          name: result.user.name,
          email: result.user.email,
          image: null,
          authentikUid: result.user.authentik_uid ?? null,
          username: result.user.email,
          apiToken: result.token,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Restrict SSO sign-in to the ADMIN_EMAILS allowlist during development.
    // The local provider bypasses this check — it has its own server-side guard
    // (ALLOW_LOCAL_AUTH env var + seeded roles on the Laravel side).
    async signIn({ user, account }) {
      if (account?.provider === 'local') return true

      const raw = process.env.ADMIN_EMAILS ?? ''
      const allowlist = raw.split(',').map((e) => e.trim()).filter(Boolean)
      if (allowlist.length > 0 && !allowlist.includes(user.email ?? '')) {
        return '/login?error=AccessDenied'
      }
      return true
    },

    jwt({ token, user }) {
      if (user) {
        token.authentikUid = user.authentikUid
        token.username = user.username
        token.apiToken = user.apiToken
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.authentikUid = token.authentikUid
        session.user.username = token.username
      }
      // apiToken is on the session for server-side use (Server Components, Route Handlers).
      // Never read it in Client Components — call a Route Handler instead.
      session.apiToken = token.apiToken
      return session
    },
  },
})
