'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Icon from '@/components/Icon'
import PoroMark from '@/components/PoroMark'

type State = 'default' | 'loading' | 'error' | 'locked' | 'not-in-directory'

const schema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})
type FormData = z.infer<typeof schema>

const BANNERS: Record<string, { msg: string; tone: 'rose' | 'amber' }> = {
  error: {
    msg: 'Email or password incorrect. Try again.',
    tone: 'rose',
  },
  locked: {
    msg: 'Account locked after 5 failed attempts. Contact your administrator or try again later.',
    tone: 'rose',
  },
  'not-in-directory': {
    msg: "Your account doesn't have access to this portal. Contact your IT administrator.",
    tone: 'rose',
  },
}

function ErrorBanner({ msg, tone }: { msg: string; tone: 'rose' | 'amber' }) {
  const amber = tone === 'amber'
  return (
    <div
      style={{
        background: amber ? 'var(--amber-50)' : 'var(--rose-50)',
        color: amber ? 'var(--amber-600)' : 'var(--rose-600)',
        border: '1px solid',
        borderColor: amber ? '#fde68a' : '#f3c4cc',
        borderRadius: 10,
        padding: '10px 12px',
        fontSize: 12,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 14,
      }}
    >
      <Icon name="alert" size={14} style={{ marginTop: 1 }} />
      <span>{msg}</span>
    </div>
  )
}

export default function LoginForm({
  allowLocalAuth,
  nextAuthError,
  callbackUrl,
}: {
  allowLocalAuth: boolean
  nextAuthError?: string
  callbackUrl?: string
}) {
  const router = useRouter()

  const [state, setState] = useState<State>(() => {
    if (nextAuthError === 'AccessDenied') return 'not-in-directory'
    if (nextAuthError) return 'error'
    return 'default'
  })
  const [revealed, setRevealed] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const { register, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const identifierValue = watch('identifier', '')
  const loading = state === 'loading'

  async function onSubmit(data: FormData) {
    setState('loading')
    const isEmail = data.identifier.includes('@')
    const provider = isEmail && allowLocalAuth ? 'local' : 'sso'
    const credentials =
      provider === 'local'
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password }

    const result = await signIn(provider, { ...credentials, redirect: false })

    if (result?.error === 'AccessDenied') {
      setState('not-in-directory')
      return
    }
    if (result?.error) {
      setState('error')
      return
    }

    // Only honour relative callbackUrls to prevent open-redirect attacks
    const destination = callbackUrl?.startsWith('/') ? callbackUrl : '/dashboard'
    router.push(destination)
    router.refresh()
  }

  const banner = BANNERS[state]
  const emailError = state === 'not-in-directory'
  const passwordError = state === 'error' || state === 'locked'
  const showEmailCheck = !emailError && identifierValue.length > 0 && state !== 'default'

  const fieldLabel = allowLocalAuth ? 'Work email' : 'COMFAC username'
  const fieldPlaceholder = allowLocalAuth ? 'you@comfac-it.com' : 'Enter your username'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper)',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px 16px',
      }}
    >
      {/* Radial glows */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -200, right: -200,
          width: 600, height: 600, pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: -240, left: -160,
          width: 540, height: 540, pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="login-grid"
        style={{
          width: '100%',
          maxWidth: 880,
          position: 'relative',
          background: 'var(--card)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid var(--ink-100)',
          boxShadow: '0 30px 80px -30px rgba(39,32,48,.18), 0 8px 24px -12px rgba(39,32,48,.08)',
        }}
      >
        {/* Left — brand panel */}
        <div
          className="login-brand"
          style={{
            background: 'var(--card)',
            borderRight: '1px solid var(--ink-100)',
            padding: '36px 36px 32px',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: -80, right: -80,
              width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, var(--purple-50) 0%, transparent 70%)',
            }}
          />
          <div style={{ position: 'relative' }}>
            <a
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
            >
              <PoroMark size={26} color="var(--purple-700)" />
              <span
                style={{
                  fontWeight: 800, fontSize: 22, letterSpacing: -0.6,
                  color: 'var(--ink-900)',
                }}
              >
                Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
              </span>
            </a>
            <div
              style={{
                marginTop: 36, fontSize: 26, lineHeight: 1.2,
                letterSpacing: -0.6, fontWeight: 700, color: 'var(--ink-900)',
                maxWidth: 320,
              }}
            >
              Welcome back.<br />
              Sign in to{' '}
              <span style={{ color: 'var(--purple-700)' }}>Porti.</span>
            </div>
            <div
              style={{
                marginTop: 10, fontSize: 13, color: 'var(--ink-500)',
                lineHeight: 1.55, maxWidth: 320,
              }}
            >
              File requests, track tickets, and access COMFAC IT services — all in one place.
            </div>
          </div>

          <div
            style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              gap: 12, marginTop: 36,
            }}
          >
            {(
              [
                ['check-circle', 'Track every ticket you file in one feed'],
                ['users', 'Direct hand-off to the right IT team'],
              ] as [string, string][]
            ).map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 12.5, color: 'var(--ink-700)',
                }}
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: 'var(--purple-50)', color: 'var(--purple-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon name={icon} size={13} color="var(--purple-700)" />
                </div>
                {text}
              </div>
            ))}

            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-500)' }}>
              Need access? Email{' '}
              <a
                href="mailto:it@comfac-it.com"
                style={{ color: 'var(--purple-700)', fontWeight: 600 }}
              >
                it@comfac-it.com
              </a>
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div
          style={{
            padding: '40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: 'var(--card)',
          }}
        >
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 500,
              textDecoration: 'none', marginBottom: 20,
            }}
          >
            <Icon name="arrow-left" size={12} color="var(--ink-500)" />
            porti.comfac-it.com
          </a>

          <div
            style={{
              fontSize: 20, fontWeight: 700, letterSpacing: -0.4,
              marginBottom: 4, color: 'var(--ink-900)',
            }}
          >
            Sign in to Porti
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 22 }}>
            Use your COMFAC work credentials — we&apos;ll take you to the right place.
          </div>

          {banner && <ErrorBanner msg={banner.msg} tone={banner.tone} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Identifier */}
            <label
              style={{
                display: 'block', fontSize: 11.5, fontWeight: 600,
                color: 'var(--ink-700)', marginBottom: 6,
              }}
            >
              {fieldLabel}
            </label>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--paper)',
                border: `1px solid ${emailError ? 'var(--rose-600)' : 'var(--ink-100)'}`,
                borderRadius: 10, padding: '10px 12px', marginBottom: 14,
                transition: 'border-color .15s',
              }}
            >
              <Icon name="mail" size={14} color="var(--ink-500)" />
              <input
                type={allowLocalAuth ? 'email' : 'text'}
                autoComplete={allowLocalAuth ? 'email' : 'username'}
                autoFocus
                placeholder={fieldPlaceholder}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit',
                }}
                {...register('identifier')}
              />
              {showEmailCheck && (
                <Icon name="check-circle" size={14} color="var(--green-600)" />
              )}
            </div>

            {/* Password label row */}
            <div
              style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 6,
              }}
            >
              <label
                style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)' }}
              >
                Password
              </label>
              <button
                type="button"
                style={{
                  fontSize: 11, color: 'var(--purple-700)', fontWeight: 600,
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Forgot?
              </button>
            </div>

            {/* Password field */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--paper)',
                border: `1px solid ${passwordError ? 'var(--rose-600)' : 'var(--ink-100)'}`,
                borderRadius: 10, padding: '10px 12px',
                marginBottom: capsLock ? 6 : 0,
                transition: 'border-color .15s',
              }}
            >
              <Icon name="lock" size={14} color="var(--ink-500)" />
              <input
                type={revealed ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit',
                }}
                {...register('password')}
                onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
              />
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                aria-label={revealed ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: revealed ? 'var(--purple-700)' : 'var(--ink-500)',
                }}
              >
                <Icon
                  name={revealed ? 'eye-off' : 'eye'}
                  size={14}
                  color={revealed ? 'var(--purple-700)' : 'var(--ink-500)'}
                />
              </button>
            </div>

            {capsLock && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, color: 'var(--amber-600)', marginTop: 6,
                }}
              >
                <Icon name="alert" size={11} color="var(--amber-600)" />
                Caps Lock is on
              </div>
            )}

            {/* Keep me signed in */}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
                fontSize: 12, color: 'var(--ink-700)', cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                  border: '1.5px solid var(--ink-300)', background: 'var(--card)',
                  display: 'inline-block',
                }}
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: 22,
                background: loading ? 'var(--purple-600)' : 'var(--purple-700)',
                color: '#fff', border: 'none',
                padding: '12px 16px', borderRadius: 10,
                fontSize: 13.5, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 1px 0 rgba(255,255,255,.15) inset, 0 6px 16px -8px rgba(91,77,200,.5)',
                opacity: loading ? 0.85 : 1,
                transition: 'background .15s, opacity .15s',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: 'inline-block', width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,.35)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'porti-spin 0.7s linear infinite',
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <Icon name="arrow-right" size={14} color="#fff" />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 16, fontSize: 11.5,
              color: 'var(--ink-500)', textAlign: 'center',
            }}
          >
            New here?{' '}
            <a
              href="mailto:it@comfac-it.com"
              style={{ color: 'var(--purple-700)', fontWeight: 600 }}
            >
              Request access
            </a>
          </div>

          <div
            style={{
              marginTop: 20, padding: 10,
              background: 'var(--paper)', border: '1px solid var(--ink-100)',
              borderRadius: 8, fontSize: 11, color: 'var(--ink-500)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icon name="shield" size={11} color="var(--ink-500)" />
            Your credentials are verified through COMFAC&apos;s secure directory.
          </div>
        </div>
      </div>
    </main>
  )
}
