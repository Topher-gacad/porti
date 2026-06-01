'use client'

import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'

type Service = { letter: string; fg: string; bg: string; name: string; desc: string }
type Category = { name: string; items: Service[] }

const CATEGORIES: Category[] = [
  {
    name: 'Productivity',
    items: [
      { letter: 'E', fg: 'var(--ink-900)', bg: 'var(--card)',        name: 'ERPNext',    desc: 'Finance, HR, inventory' },
      { letter: 'N', fg: '#fff',           bg: '#0082c9',             name: 'Nextcloud',  desc: 'Files, calendar, contacts' },
      { letter: 'M', fg: '#fff',           bg: 'var(--amber-600)',    name: 'Mailcow',    desc: 'Email & groupware' },
    ],
  },
  {
    name: 'Operations',
    items: [
      { letter: 'S', fg: '#fff', bg: 'var(--orange-600)',  name: 'Synx FMS',   desc: 'Facility maintenance' },
      { letter: 'S', fg: '#fff', bg: 'var(--blue-600)',    name: 'Synx Sched', desc: 'Crew scheduling' },
      { letter: 'S', fg: '#fff', bg: 'var(--violet-600)',  name: 'Steward',    desc: 'Asset & inventory' },
      { letter: 'F', fg: '#fff', bg: 'var(--green-600)',   name: 'Fleet',      desc: 'Vehicle tracking' },
    ],
  },
  {
    name: 'Comms',
    items: [
      { letter: 'R', fg: '#fff', bg: '#5865F2',  name: 'Rocket.Chat', desc: 'Internal messaging' },
      { letter: 'J', fg: '#fff', bg: '#2684FF',  name: 'Jitsi',       desc: 'Video conferencing' },
    ],
  },
  {
    name: 'Internal tools',
    items: [
      { letter: 'C', fg: '#fff',           bg: 'var(--purple-700)', name: 'Porti',     desc: 'IT service portal' },
      { letter: 'G', fg: '#fff',           bg: 'var(--ink-900)',    name: 'Gitea',     desc: 'Source control' },
      { letter: 'W', fg: '#fff',           bg: '#1568b3',           name: 'Wiki',      desc: 'Internal knowledge base' },
      { letter: 'B', fg: '#fff',           bg: 'var(--rose-600)',   name: 'BookStack', desc: 'Documentation' },
    ],
  },
]

const FILTER_CHIPS = ['All', 'Productivity', 'Operations', 'Comms', 'Internal tools']

function ServiceGlyph({ letter, fg, bg }: { letter: string; fg: string; bg: string }) {
  return (
    <div
      style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, letterSpacing: -0.5,
        border: bg === 'var(--card)' ? '1px solid var(--ink-100)' : 'none',
      }}
    >
      {letter}
    </div>
  )
}

export default function AllServicesModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setActiveCategory('All')
    }
  }, [open])

  if (!open) return null

  const q = searchQuery.toLowerCase()
  const filtered = CATEGORIES
    .filter(cat => activeCategory === 'All' || cat.name === activeCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
      ),
    }))
    .filter(cat => cat.items.length > 0)

  const totalShown = filtered.reduce((n, c) => n + c.items.length, 0)

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: 'var(--paper)', opacity: 0.6, backdropFilter: 'blur(2px)' }}
      />
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: 'rgba(39,32,48,.08)' }}
      />

      {/* Glows */}
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

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All services"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 880, maxHeight: 680,
          background: 'var(--card)', borderRadius: 18,
          boxShadow: '0 30px 80px -20px rgba(0,0,0,.45), 0 8px 24px -8px rgba(0,0,0,.2)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px', borderBottom: '1px solid var(--ink-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink-900)' }}>
              All services
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
              13 internal apps available across COMFAC
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', padding: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', borderRadius: 6,
              color: 'var(--ink-500)',
            }}
          >
            <Icon name="x" size={16} color="var(--ink-500)" />
          </button>
        </div>

        {/* Search + chips */}
        <div style={{ padding: '14px 24px 0', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--paper)', border: '1.5px solid var(--ink-200)',
              borderRadius: 10, padding: '10px 12px',
            }}
          >
            <Icon name="search" size={14} color="var(--ink-500)" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or apps…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit',
              }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Icon name="x" size={12} color="var(--ink-500)" />
              </button>
            ) : (
              <span
                style={{
                  fontSize: 10, color: 'var(--ink-500)',
                  padding: '2px 6px', border: '1px solid var(--ink-200)',
                  borderRadius: 4, fontFamily: 'inherit',
                }}
              >
                ⌘K
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {FILTER_CHIPS.map((chip) => {
              const active = activeCategory === chip
              return (
                <button
                  key={chip}
                  onClick={() => setActiveCategory(chip)}
                  style={{
                    padding: '5px 12px', borderRadius: 99,
                    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    background: active ? 'var(--purple-700)' : 'var(--paper)',
                    color: active ? '#fff' : 'var(--ink-700)',
                    border: '1px solid',
                    borderColor: active ? 'var(--purple-700)' : 'var(--ink-200)',
                    fontFamily: 'inherit',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
        </div>

        {/* Service grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 20px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 0', textAlign: 'center',
                fontSize: 13, color: 'var(--ink-500)',
              }}
            >
              No services match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filtered.map((cat) => (
              <div key={cat.name} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 1,
                    color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10,
                  }}
                >
                  {cat.name}
                </div>
                <div className="services-grid">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        background: 'var(--paper)', border: '1px solid var(--ink-100)',
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', transition: 'border-color .15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--purple-200)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ink-100)')}
                    >
                      <ServiceGlyph letter={item.letter} fg={item.fg} bg={item.bg} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>
                          {item.desc}
                        </div>
                      </div>
                      <Icon name="arrow-up-right" size={14} color="var(--ink-500)" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px', borderTop: '1px solid var(--ink-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--paper)', flexShrink: 0,
            fontSize: 11.5,
          }}
        >
          <span style={{ color: 'var(--ink-500)' }}>
            Need an app that&apos;s not here?{' '}
            <a
              href="mailto:it@comfac-it.com"
              style={{ color: 'var(--purple-700)', fontWeight: 600 }}
            >
              Request access →
            </a>
          </span>
          <button
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            View full directory →
          </button>
        </div>
      </div>
    </div>
  )
}
