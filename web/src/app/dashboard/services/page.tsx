'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'
import { useApps, useLaunchApp } from '@/hooks/useApps'
import type { PortalApp } from '@/types/models'

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--ink-100)',
  borderRadius: 14,
}

export default function ServicesPage() {
  const { data: apps, isLoading, isError } = useApps()
  const launch = useLaunchApp()
  const [launchingKey, setLaunchingKey] = useState<string | null>(null)

  async function open(app: PortalApp) {
    if (launchingKey) return
    setLaunchingKey(app.key)
    // Open the tab synchronously (before the await) so it isn't blocked as a popup,
    // then point it at the audited launch URL once resolved.
    const win = window.open('about:blank', '_blank')
    try {
      const url = await launch.mutateAsync(app.key)
      if (win) {
        win.opener = null
        win.location.href = url
      } else {
        // Popup was blocked — navigate the current tab instead (assign() is a method
        // call, so it sidesteps the no-direct-mutation lint rule on window.location).
        window.location.assign(url)
      }
    } catch {
      win?.close()
    } finally {
      setLaunchingKey(null)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>
          Services
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
          Your apps and tools — click to open
        </div>
      </div>

      {isLoading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading…</div>}
      {isError && <div style={{ fontSize: 13, color: 'var(--rose-600)' }}>Failed to load services.</div>}

      {apps && apps.length === 0 && (
        <div style={{ ...card, padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
          No services are available to you yet.
        </div>
      )}

      {apps && apps.length > 0 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}
        >
          {apps.map((app) => {
            const busy = launchingKey === app.key
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => open(app)}
                disabled={busy}
                style={{
                  ...card,
                  padding: 18,
                  textAlign: 'left',
                  cursor: busy ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'box-shadow .15s, border-color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--purple-100)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--ink-100)' }}
              >
                <div className="flex items-center" style={{ gap: 12 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--purple-50)', color: 'var(--purple-700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, fontWeight: 800,
                    }}
                  >
                    {app.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0" style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.name}
                    </div>
                    {app.description && (
                      <div style={{ fontSize: 11.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.description}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center"
                  style={{ gap: 5, fontSize: 12, fontWeight: 600, color: busy ? 'var(--ink-500)' : 'var(--purple-700)' }}
                >
                  {busy ? 'Opening…' : 'Open'}
                  {!busy && <Icon name="arrow-up-right" size={13} color="var(--purple-700)" />}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
