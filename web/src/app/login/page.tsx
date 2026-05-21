import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import LoginForm from './_components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-white tracking-tight">IT Portal</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
          </div>

          {error === 'AccessDenied' && (
            <div className="mb-6 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-400">
              Your account does not have access to this portal. Contact your administrator.
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </main>
  )
}
