import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="text-slate-400">
          Welcome back, {session.user?.name ?? session.user?.username ?? session.user?.email}
        </p>
      </div>
    </main>
  )
}
