'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

/*
 * Porti admin Dashboard — operations command center (porti_admin handoff).
 *
 * NOTE: the IT service-desk backend (tickets, SLA, queues, volume) does not exist
 * yet, so the figures below are placeholder data matching the design. Replace each
 * block with server-driven data once the ticket endpoints ship — the markup is the
 * contract, the numbers are not.
 */

type Tone = 'rose' | 'amber' | 'purple'

const QUEUE: { id: string; title: string; badge: string; tone: Tone; due: string; owner: string }[] = [
  { id: 'ST-9812', title: 'Outlook crash on shared mailbox', badge: 'ST', tone: 'rose', due: 'PAST SLA · 4h', owner: 'Joan Cabral' },
  { id: 'SR-2104', title: 'New laptop request from Mark Reyes', badge: 'SR', tone: 'amber', due: 'Due 2h', owner: 'Unassigned' },
  { id: 'ST-9818', title: 'Slack notifications not working · iOS', badge: 'ST', tone: 'purple', due: 'Due 1d', owner: 'Jay Lim' },
  { id: 'AR-0312', title: 'Monitor for 3F-Ops', badge: 'AR', tone: 'amber', due: 'Due 4d', owner: 'Unassigned' },
  { id: 'CR-1043', title: 'Firewall rule for build server', badge: 'CR', tone: 'purple', due: 'Due 5d', owner: 'Aldo Reyes' },
]

const BY_TYPE: { name: string; value: number; color: string }[] = [
  { name: 'Support Ticket', value: 184, color: 'var(--purple-700)' },
  { name: 'Service Request', value: 22, color: 'var(--blue-600)' },
  { name: 'Asset Request', value: 14, color: 'var(--orange-600)' },
  { name: 'Change Request', value: 8, color: 'var(--green-600)' },
]
const BY_TYPE_TOTAL = 228

const SLA_BARS = [88, 92, 96, 99, 97, 98, 96.4]

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--ink-100)',
  borderRadius: 14,
}

const toneColor: Record<Tone, string> = {
  rose: 'var(--rose-600)',
  amber: 'var(--amber-600)',
  purple: 'var(--purple-700)',
}

type Segment = 'All' | 'Mine' | 'Unassigned'

export default function DashboardPage() {
  const [segment, setSegment] = useState<Segment>('All')

  const rows = QUEUE.filter((r) => {
    if (segment === 'Unassigned') return r.owner === 'Unassigned'
    if (segment === 'Mine') return r.owner !== 'Unassigned'
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="flex items-end justify-between" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>
            Dashboard
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
            Live snapshot · last updated 12s ago
          </div>
        </div>
      </div>

      {/* Mega stat cards */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
        {/* Open queue */}
        <div style={{ ...card, padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
              Open queue
            </span>
            <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>● healthy</span>
          </div>
          <div className="flex items-baseline" style={{ gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>6</span>
            <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>open tickets</span>
          </div>
          <div className="flex" style={{ height: 8, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: '34%', background: 'var(--amber-600)' }} />
            <div style={{ width: '66%', background: 'var(--purple-700)' }} />
          </div>
          <div className="flex justify-between" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-500)' }}>
            <span>2 pending</span>
            <span>4 in progress</span>
          </div>
        </div>

        {/* SLA compliance */}
        <div style={{ ...card, padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
              SLA compliance
            </span>
            <span style={{ fontSize: 11, color: 'var(--amber-600)', fontWeight: 600 }}>● watch</span>
          </div>
          <div className="flex items-baseline" style={{ gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>96.4%</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose-600)' }}>↓ 1.2pt</span>
          </div>
          <div className="flex items-end" style={{ gap: 4, height: 28 }}>
            {SLA_BARS.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${v - 80}%`,
                  background: i === SLA_BARS.length - 1 ? 'var(--purple-700)' : 'var(--ink-200)',
                  borderRadius: 2,
                  minHeight: 2,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 6 }}>
            1 of 28 tickets past SLA · last 7d
          </div>
        </div>

        {/* Avg resolution */}
        <div style={{ ...card, padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
              Avg resolution
            </span>
            <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>● fast</span>
          </div>
          <div className="flex items-baseline" style={{ gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>2.7h</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)' }}>↓ 18m</span>
          </div>
          <div className="flex flex-col" style={{ gap: 6, fontSize: 11 }}>
            {[
              ['Support Ticket', '1.4h'],
              ['Service Request', '1d 2h'],
              ['Asset Request', '3d 18h'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--ink-500)' }}>{label}</span>
                <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My queue */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div
          className="flex items-center"
          style={{ padding: '18px 22px', gap: 14, borderBottom: '1px solid var(--ink-100)' }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>My queue</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>
              {QUEUE.length} tickets · sorted by SLA risk
            </div>
          </div>
          <div
            className="inline-flex"
            style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, padding: 2 }}
          >
            {(['All', 'Mine', 'Unassigned'] as Segment[]).map((p) => {
              const on = segment === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSegment(p)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: on ? 'var(--card)' : 'transparent',
                    color: on ? 'var(--ink-900)' : 'var(--ink-500)',
                    boxShadow: on ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="grid items-center"
              style={{
                gridTemplateColumns: '64px 24px 1fr 130px 130px 16px',
                gap: 14,
                padding: '13px 22px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{r.id}</span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: '2px 5px',
                  background: 'var(--ink-900)',
                  color: '#fff',
                  borderRadius: 4,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                {r.badge}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-900)' }}>{r.title}</span>
              <span
                className="inline-flex items-center"
                style={{ fontSize: 11, fontWeight: 600, gap: 5, color: toneColor[r.tone] }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} />
                {r.due}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: r.owner === 'Unassigned' ? 'var(--ink-500)' : 'var(--ink-700)',
                  fontStyle: r.owner === 'Unassigned' ? 'italic' : 'normal',
                }}
              >
                {r.owner}
              </span>
              <Icon name="chevron-right" size={13} color="var(--ink-500)" />
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ padding: '24px 22px', fontSize: 13, color: 'var(--ink-500)' }}>
              No tickets in this view.
            </div>
          )}
        </div>
      </div>

      {/* Bottom: volume + by type */}
      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        {/* Volume */}
        <div style={{ ...card, padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Volume · 30 days</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Stacked by status</div>
            </div>
            <div className="flex" style={{ gap: 12, fontSize: 11, color: 'var(--ink-700)' }}>
              {[
                ['Resolved', 'var(--green-600)'],
                ['In progress', 'var(--purple-700)'],
                ['Pending', 'var(--amber-600)'],
              ].map(([n, c]) => (
                <span key={n} className="inline-flex items-center" style={{ gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /> {n}
                </span>
              ))}
            </div>
          </div>
          <div
            className="flex items-end"
            style={{ gap: 4, height: 180, paddingBottom: 18, borderBottom: '1px solid var(--ink-100)' }}
          >
            {Array.from({ length: 30 }).map((_, i) => {
              const resolved = 14 + Math.sin(i * 0.5) * 6 + (i % 4) * 3
              const pending = 3 + Math.cos(i * 0.7) * 2
              const inProgress = 5 + Math.sin(i * 0.3) * 3
              return (
                <div key={i} className="flex flex-col justify-end" style={{ flex: 1, gap: 1 }}>
                  <div style={{ height: resolved, background: 'var(--green-600)', opacity: 0.85, borderRadius: '3px 3px 0 0' }} />
                  <div style={{ height: inProgress, background: 'var(--purple-700)', opacity: 0.85 }} />
                  <div style={{ height: pending, background: 'var(--amber-600)', opacity: 0.85, borderRadius: '0 0 3px 3px' }} />
                </div>
              )
            })}
          </div>
        </div>

        {/* By type */}
        <div style={{ ...card, padding: 22 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>By type</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, marginBottom: 16 }}>
            {BY_TYPE_TOTAL} total
          </div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {BY_TYPE.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ink-700)', fontWeight: 500 }}>{t.name}</span>
                  <span style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{t.value}</span>
                </div>
                <div style={{ height: 6, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(t.value / BY_TYPE_TOTAL) * 100}%`,
                      height: '100%',
                      background: t.color,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
