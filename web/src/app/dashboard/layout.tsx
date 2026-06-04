import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  const letters = parts.slice(0, 2).map((p) => p[0])
  return letters.join('').toUpperCase()
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const name = session.user?.name ?? session.user?.username ?? session.user?.email ?? 'User'

  return <AdminShell userInitials={initialsFrom(name)} userName={name}>{children}</AdminShell>
}
