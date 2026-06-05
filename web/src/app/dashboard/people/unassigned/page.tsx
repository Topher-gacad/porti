'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { usePermissions } from '@/hooks/usePermissions'
import { useAllCompanies } from '@/hooks/useCompanies'
import { useUnassignedUsers, useAssignUserCompany } from '@/hooks/useUnassignedUsers'
import type { User } from '@/types/models'

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--ink-100)',
  borderRadius: 12,
}

const cols = '2.4fr 1.6fr 1fr 1.6fr'

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'
}

export default function UnassignedUsersPage() {
  const { hasAnyRole, isLoading: permsLoading } = usePermissions()
  const privileged = hasAnyRole('super-admin', 'developer')

  const [page, setPage] = useState(1)
  const { data, isLoading } = useUnassignedUsers(page)
  const { data: companies = [] } = useAllCompanies()
  const assign = useAssignUserCompany()

  const [picks, setPicks] = useState<Record<number, number | ''>>({})
  const [assigningId, setAssigningId] = useState<number | null>(null)

  async function handleAssign(user: User) {
    const companyId = picks[user.id]
    if (!companyId) return
    setAssigningId(user.id)
    try {
      await assign.mutateAsync({ id: user.id, company_id: Number(companyId) })
      setPicks((p) => {
        const next = { ...p }
        delete next[user.id]
        return next
      })
    } finally {
      setAssigningId(null)
    }
  }

  if (!permsLoading && !privileged) {
    return (
      <div style={{ ...card, padding: 28, textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
        You don’t have access to the Unassigned users queue.
      </div>
    )
  }

  const rows = data?.data ?? []

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/dashboard/people"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-500)', textDecoration: 'none', marginBottom: 8 }}
        >
          <Icon name="arrow-left" size={13} color="var(--ink-500)" /> People
        </Link>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>
          Unassigned users
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>
          People who signed in via SSO but couldn’t be matched to a company. Assign each to a company to grant access.
        </div>
      </div>

      {(isLoading || permsLoading) && (
        <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading…</div>
      )}

      {!isLoading && rows.length === 0 && (
        <div style={{ ...card, padding: 28, textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
          No unassigned users — everyone with access belongs to a company.
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', alignItems: 'center', gap: 12 }}>
            <span>User</span>
            <span>Identity</span>
            <span>Joined</span>
            <span>Assign to company</span>
          </div>

          {rows.map((u, i) => (
            <div
              key={u.id}
              style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--amber-600)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flex: '0 0 auto' }}>{initials(u.name)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                </div>
              </div>

              <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>
                {u.authentik_uid ? 'SSO' : 'Local'}
              </span>

              <span style={{ color: 'var(--ink-500)' }}>
                {new Date(u.created_at).toLocaleDateString()}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={picks[u.id] ?? ''}
                  onChange={(e) => setPicks((p) => ({ ...p, [u.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                  aria-label={`Company for ${u.name}`}
                  style={{ flex: 1, minWidth: 0, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 7, padding: '6px 8px', fontSize: 12, color: 'var(--ink-900)', fontFamily: 'inherit' }}
                >
                  <option value="">— select —</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAssign(u)}
                  disabled={!picks[u.id] || assigningId === u.id}
                  style={{ background: 'var(--ink-900)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: !picks[u.id] || assigningId === u.id ? 'default' : 'pointer', opacity: !picks[u.id] || assigningId === u.id ? 0.5 : 1, fontFamily: 'inherit', flex: '0 0 auto' }}
                >
                  {assigningId === u.id ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </div>
          ))}

          {data && data.meta.last_page > 1 && (
            <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', background: 'var(--paper)' }}>
              <span>{data.meta.total} unassigned</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.meta.current_page === 1} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: data.meta.current_page === 1 ? 'default' : 'pointer', opacity: data.meta.current_page === 1 ? 0.5 : 1, fontFamily: 'inherit' }}>← Prev</button>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)' }}>{data.meta.current_page} / {data.meta.last_page}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))} disabled={data.meta.current_page === data.meta.last_page} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: data.meta.current_page === data.meta.last_page ? 'default' : 'pointer', opacity: data.meta.current_page === data.meta.last_page ? 0.5 : 1, fontFamily: 'inherit' }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
