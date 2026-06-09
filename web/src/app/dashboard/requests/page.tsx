'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import StateBadge from '@/components/submissions/StateBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { useSubmissions, type SubmissionScope } from '@/hooks/useSubmissions'

const cols = '1fr 1.6fr 1.2fr 1fr'

const primaryAdmin: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink-900)', color: '#fff',
  border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
}

export default function RequestsPage() {
  const router = useRouter()
  const { can, hasAnyRole } = usePermissions()
  const canApprove = can('submissions.approve') || hasAnyRole('super-admin', 'developer')

  const [scope, setScope] = useState<SubmissionScope>('mine')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useSubmissions(scope, page)

  const segments: { id: SubmissionScope; label: string }[] = [
    { id: 'mine', label: 'My requests' },
    ...(canApprove ? [{ id: 'inbox' as const, label: 'Approvals inbox' }] : []),
  ]

  const rows = data?.data ?? []

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>Requests</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>
            File a request and track it through approval.
          </div>
        </div>
        <Link href="/dashboard/requests/new" style={primaryAdmin}>
          <Icon name="plus" size={13} color="#fff" /> New request
        </Link>
      </div>

      {/* Segments */}
      <div style={{ display: 'inline-flex', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: 3, marginBottom: 14 }}>
        {segments.map((s) => {
          const on = scope === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => { setScope(s.id); setPage(1) }}
              style={{
                padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink-900)' : 'var(--ink-500)',
                boxShadow: on ? '0 1px 2px rgba(0,0,0,.05)' : 'none',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {isLoading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading…</div>}
      {isError && <div style={{ fontSize: 13, color: 'var(--rose-600)' }}>Failed to load requests.</div>}

      {data && rows.length === 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 28, textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
          {scope === 'inbox' ? 'Nothing awaiting your approval.' : 'You haven’t filed any requests yet.'}
        </div>
      )}

      {data && rows.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', gap: 12 }}>
            <span>Number</span><span>Request</span><span>Status</span><span>Filed</span>
          </div>

          {rows.map((s, i) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/requests/${s.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/requests/${s.id}`) }}
              style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <span className="mono" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{s.number}</span>
              <span>{s.form_name ?? s.form_key}</span>
              <span><StateBadge state={s.state} category={s.state_category} /></span>
              <span style={{ color: 'var(--ink-500)' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</span>
            </div>
          ))}

          {data.last_page > 1 && (
            <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', background: 'var(--paper)' }}>
              <span>{data.total} total</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.current_page === 1} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: data.current_page === 1 ? 'default' : 'pointer', opacity: data.current_page === 1 ? 0.5 : 1, fontFamily: 'inherit' }}>← Prev</button>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)' }}>{data.current_page} / {data.last_page}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.last_page, p + 1))} disabled={data.current_page === data.last_page} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: data.current_page === data.last_page ? 'default' : 'pointer', opacity: data.current_page === data.last_page ? 0.5 : 1, fontFamily: 'inherit' }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
