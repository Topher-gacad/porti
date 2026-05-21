import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authenticateWithAuthentik } from '@/lib/authentik'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await authenticateWithAuthentik(
          credentials.username as string,
          credentials.password as string,
        )

        if (!user || !user.is_active) return null

        return {
          id: user.uid,
          name: user.name,
          email: user.email,
          image: user.avatar || null,
          authentikUid: user.uid,
          username: user.username,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Restrict sign-in to allowed emails while the app is in admin-only mode.
    // Set ADMIN_EMAILS=a@x.com,b@x.com in .env.local. Leave empty to allow all.
    async signIn({ user }) {
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
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.authentikUid = token.authentikUid
        session.user.username = token.username
      }
      return session
    },
  },
})
