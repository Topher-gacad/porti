import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    authentikUid?: string
    username?: string
    apiToken?: string
  }
  interface Session {
    apiToken?: string
    user: {
      authentikUid?: string
      username?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    authentikUid?: string
    username?: string
    apiToken?: string
  }
}
