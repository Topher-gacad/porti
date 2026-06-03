'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Icon from '@/components/Icon'
import PoroMark from '@/components/PoroMark'

type Tab = { id: string; icon: string; label: string; href?: string; badge?: string }

// Per the porti_admin handoff. Only Dashboard is built today; the other surfaces
// (Services, Requests, …) are separate handoffs — rendered as inert tabs for now
// so they appear per the design without producing dead links. Give them an `href`
// as each surface ships.
const TABS: Tab[] = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', href: '/dashboard' },
  { id: 'services', icon: 'grid', label: 'Services' },
  { id: 'requests', icon: 'inbox', label: 'Requests', badge: '4' },
  { id: 'kb', icon: 'book', label: 'Knowledge Base' },
  { id: 'board', icon: 'message-circle', label: 'Community' },
  { id: 'people', icon: 'users', label: 'People', href: '/dashboard/people' },
  { id: 'insights', icon: 'bar-chart', label: 'Insights' },
]

const tBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--paper)',
  border: '1px solid var(--ink-100)',
  borderRadius: 9,
  padding: 8,
  cursor: 'pointer',
}

const primaryAdmin: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--ink-900)',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: '8px 14px',
  fontSize: 12.5,
  fontWeight: 600,
  cursor: 'pointer',
}

// The design was previewed in a fixed-width browser bezel. On large monitors
// (e.g. 1920px) the bars still span full width, but content is capped + centered
// so it keeps the design's proportions instead of stretching edge-to-edge.
const MAX_W = 1400
const railInner: React.CSSProperties = { maxWidth: MAX_W, marginLeft: 'auto', marginRight: 'auto', width: '100%' }

const menuItem: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 10px',
  borderRadius: 7,
  fontSize: 13,
  color: 'var(--ink-700)',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function AdminShell({
  children,
  userInitials = 'U',
  userName,
}: {
  children: React.ReactNode
  userInitials?: string
  userName?: string
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(tab: Tab): boolean {
    if (!tab.href) return false
    // '/dashboard' is the index of every dashboard route, so it would prefix-match
    // every sub-page — match it exactly. Deeper tabs match their path + children.
    if (tab.href === '/dashboard') return pathname === '/dashboard'
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`)
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'var(--paper)', color: 'var(--ink-900)' }}
    >
      {/* Brand row */}
      <div className="shrink-0" style={{ background: 'var(--card)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="flex items-center gap-3.5" style={{ ...railInner, height: 56, padding: '0 28px' }}>
        <PoroMark size={24} color="var(--purple-700)" />
        <span
          style={{
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: -0.5,
            color: 'var(--ink-900)',
          }}
        >
          Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '3px 8px',
            background: 'var(--purple-50)',
            color: 'var(--purple-700)',
            borderRadius: 99,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          ADMIN
        </span>

        <div
          className="flex items-center gap-2.5"
          style={{
            flex: 1,
            maxWidth: 380,
            marginLeft: 24,
            background: 'var(--paper)',
            border: '1px solid var(--ink-100)',
            borderRadius: 9,
            padding: '7px 12px',
          }}
        >
          <Icon name="search" size={14} color="var(--ink-500)" />
          <input
            className="flex-1 bg-transparent border-none outline-none"
            style={{ fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-900)' }}
            placeholder="Search…"
            aria-label="Search"
          />
          <span
            className="mono"
            style={{
              fontSize: 10,
              color: 'var(--ink-500)',
              padding: '2px 6px',
              border: '1px solid var(--ink-200)',
              borderRadius: 4,
            }}
          >
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-1.5" style={{ marginLeft: 'auto' }}>
          <button type="button" style={tBtn} aria-label="Messages">
            <Icon name="message-circle" size={15} color="var(--ink-700)" />
          </button>
          <button type="button" style={{ ...tBtn, position: 'relative' }} aria-label="Notifications">
            <Icon name="bell" size={15} color="var(--ink-700)" />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: 99,
                background: 'var(--rose-600)',
                border: '2px solid var(--card)',
              }}
            />
          </button>
          <button type="button" style={{ ...primaryAdmin, marginLeft: 6 }}>
            <Icon name="plus" size={13} color="#fff" /> New request
          </button>
          <div style={{ position: 'relative', marginLeft: 8 }}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{
                width: 32, height: 32, borderRadius: 99, background: 'var(--purple-700)', color: '#fff',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {userInitials}
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div
                  role="menu"
                  style={{
                    position: 'absolute', right: 0, top: 40, minWidth: 180, padding: 6, zIndex: 50,
                    background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 10,
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {userName && (
                    <div style={{ padding: '6px 10px 8px', borderBottom: '1px solid var(--ink-100)', marginBottom: 4 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                    </div>
                  )}
                  <Link href="/dashboard/profile" role="menuitem" onClick={() => setMenuOpen(false)} style={menuItem}>
                    My profile
                  </Link>
                  <button type="button" role="menuitem" onClick={() => signOut({ callbackUrl: '/login' })} style={menuItem}>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Tab row */}
      <div className="shrink-0" style={{ background: 'var(--card)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="flex items-center" style={{ ...railInner, height: 44, padding: '0 28px', gap: 2 }}>
        {TABS.map((tab) => {
          const active = isActive(tab)
          const inner = (
            <>
              <Icon name={tab.icon} size={13} color={active ? 'var(--ink-900)' : 'var(--ink-500)'} />
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    fontSize: 9.5,
                    padding: '1.5px 6px',
                    background: 'var(--purple-700)',
                    color: '#fff',
                    borderRadius: 99,
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 8,
                    right: 8,
                    bottom: -1,
                    height: 2,
                    background: 'var(--purple-700)',
                    borderRadius: 99,
                  }}
                />
              )}
            </>
          )
          const style: React.CSSProperties = {
            position: 'relative',
            height: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '0 14px',
            fontSize: 12.5,
            fontWeight: active ? 600 : 500,
            color: active ? 'var(--ink-900)' : 'var(--ink-500)',
            cursor: tab.href ? 'pointer' : 'default',
          }
          return tab.href ? (
            <Link key={tab.id} href={tab.href} style={style}>
              {inner}
            </Link>
          ) : (
            <span key={tab.id} style={style} aria-disabled="true">
              {inner}
            </span>
          )
        })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div style={{ ...railInner, padding: '24px 28px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
