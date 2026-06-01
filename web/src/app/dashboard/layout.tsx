import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const displayName =
    session.user?.name ?? session.user?.username ?? session.user?.email ?? 'User'

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-slate-700 bg-slate-800">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{displayName}</span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
