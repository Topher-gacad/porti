import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import LoginForm from './_components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const session = await auth()
  if (session) redirect('/dashboard')

  const { error, callbackUrl } = await searchParams
  const allowLocalAuth = process.env.ALLOW_LOCAL_AUTH === 'true'

  return (
    <LoginForm
      allowLocalAuth={allowLocalAuth}
      nextAuthError={error}
      callbackUrl={callbackUrl}
    />
  )
}
