'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const ssoSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const localSchema = z.object({
  email:    z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

type SsoFormData   = z.infer<typeof ssoSchema>
type LocalFormData = z.infer<typeof localSchema>

type Props = {
  allowLocalAuth: boolean
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

const submitClass =
  'w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800'

export default function LoginForm({ allowLocalAuth }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'sso' | 'local'>('sso')
  const [serverError, setServerError] = useState<string | null>(null)

  const ssoForm = useForm<SsoFormData>({ resolver: zodResolver(ssoSchema) })
  const localForm = useForm<LocalFormData>({ resolver: zodResolver(localSchema) })

  function switchMode(next: 'sso' | 'local') {
    setServerError(null)
    setMode(next)
  }

  async function onSsoSubmit(data: SsoFormData) {
    setServerError(null)
    const result = await signIn('sso', {
      username: data.username,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setServerError('Invalid username or password.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function onLocalSubmit(data: LocalFormData) {
    setServerError(null)
    const result = await signIn('local', {
      email:    data.email,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setServerError('Invalid email or password.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {allowLocalAuth && (
        <div className="flex rounded-lg overflow-hidden border border-slate-600">
          <button
            type="button"
            onClick={() => switchMode('sso')}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === 'sso'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            SSO
          </button>
          <button
            type="button"
            onClick={() => switchMode('local')}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === 'local'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            Local
          </button>
        </div>
      )}

      {mode === 'sso' && (
        <form onSubmit={ssoForm.handleSubmit(onSsoSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...ssoForm.register('username')}
              className={inputClass}
              placeholder="Enter your username"
            />
            {ssoForm.formState.errors.username && (
              <p className="mt-1.5 text-xs text-red-400">{ssoForm.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="sso-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="sso-password"
              type="password"
              autoComplete="current-password"
              {...ssoForm.register('password')}
              className={inputClass}
              placeholder="Enter your password"
            />
            {ssoForm.formState.errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{ssoForm.formState.errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={ssoForm.formState.isSubmitting}
            className={submitClass}
          >
            {ssoForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}

      {mode === 'local' && (
        <form onSubmit={localForm.handleSubmit(onLocalSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...localForm.register('email')}
              className={inputClass}
              placeholder="Enter your email"
            />
            {localForm.formState.errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{localForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="local-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="local-password"
              type="password"
              autoComplete="current-password"
              {...localForm.register('password')}
              className={inputClass}
              placeholder="Enter your password"
            />
            {localForm.formState.errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{localForm.formState.errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={localForm.formState.isSubmitting}
            className={submitClass}
          >
            {localForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  )
}
