'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import { useAllUsers } from '@/hooks/useUsers'
import { useAllDepartments } from '@/hooks/useDepartments'
import type { User } from '@/types/models'

// People · Users — admin user management (design preserved, wired to real data).
// "Admin Accounts" filters to admin-type roles; the other subnav views aren't backed
// by data yet (shown but inert). Filter chips + Import/Export are visual placeholders
// (no backend yet); selection + bulk bar are functional except the bulk actions.

const ADMIN_ROLES = ['super-admin', 'developer', 'company-admin']

type ViewId = 'users' | 'admin'

const peopleNav: { id: string; label: string; wired: boolean }[] = [
  { id: 'users', label: 'Users', wired: true },
  { id: 'it-staff', label: 'IT Staff', wired: false },
  { id: 'interns', label: 'Interns', wired: false },
  { id: 'leave', label: 'Leave Requests', wired: false },
  { id: 'overtime', label: 'Overtime', wired: false },
  { id: 'applications', label: 'Applications', wired: false },
  { id: 'admin', label: 'Admin Accounts', wired: true },
]

const PER_PAGE = 12
const tableColumns = '38px 2.4fr 1.4fr 1fr 0.8fr 1fr 1fr 40px'

const ghostBtn: React.CSSProperties = {
  background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px',
  borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
const primaryAdmin: React.CSSProperties = {
  background: 'var(--ink-900)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 9,
  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex',
  alignItems: 'center', gap: 6,
}
const bulkBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--purple-700)', color: 'var(--purple-700)',
  padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'
}

const AVATAR_COLORS = ['var(--purple-700)', 'var(--orange-600)', 'var(--rose-600)', 'var(--blue-600)', 'var(--green-600)', '#7c3aed', '#312e81']
function avatarColor(seed: string): string {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function StatTile({ label, value, color = 'var(--ink-900)' }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: -0.6, marginTop: 6 }}>{value}</div>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
    >
      {label} <span style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{value}</span>
      <Icon name="chevron-down" size={11} />
    </button>
  )
}

function RoleBadge({ role }: { role: string }) {
  const palette: [string, string] =
    role === 'super-admin' || role === 'developer'
      ? ['#312e81', '#fff']
      : role === 'company-admin'
        ? ['var(--purple-50)', 'var(--purple-700)']
        : ['var(--ink-50, #f3f4f6)', 'var(--ink-700)']
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', background: palette[0], color: palette[1], borderRadius: 99, letterSpacing: 0.3 }}>{role}</span>
}

function StatusPill({ active }: { active: boolean }) {
  const [bg, col, dot] = active
    ? ['var(--green-50)', 'var(--green-600)', 'var(--green-600)']
    : ['var(--ink-50, #f3f4f6)', 'var(--ink-500)', 'var(--ink-300)']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, background: bg, color: col, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: dot }} /> {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function primaryRole(u: User): string {
  const roles = u.roles ?? []
  return roles.find((r) => ADMIN_ROLES.includes(r)) ?? roles[0] ?? 'user'
}
function isAdmin(u: User): boolean {
  return (u.roles ?? []).some((r) => ADMIN_ROLES.includes(r))
}

export default function PeopleUsersPage() {
  const router = useRouter()
  const { data: users, isLoading } = useAllUsers()
  const { data: departments } = useAllDepartments()
  const [view, setView] = useState<ViewId>('users')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const deptName = useMemo(() => {
    const m = new Map<number, string>()
    departments?.forEach((d) => m.set(d.id, d.name))
    return m
  }, [departments])

  const all = useMemo(() => users ?? [], [users])
  const adminCount = useMemo(() => all.filter(isAdmin).length, [all])

  const counts: Record<string, number | null> = {
    users: all.length,
    admin: adminCount,
    'it-staff': null,
    interns: null,
    leave: null,
    overtime: null,
    applications: null,
  }

  const filtered = useMemo(() => {
    let list = view === 'admin' ? all.filter(isAdmin) : all
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((u) =>
        [u.name, u.email, (u.roles ?? []).join(' '), u.department_id ? deptName.get(u.department_id) ?? '' : '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return list
  }, [all, view, query, deptName])

  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, lastPage)
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const visibleIds = rows.map((r) => r.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  const stats = { total: all.length, active: all.filter((u) => u.is_active).length, inactive: all.filter((u) => !u.is_active).length, admins: adminCount }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>People</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>Manage everyone with access to the IT portal — accounts, roles, and activity.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={ghostBtn}><Icon name="upload" size={13} /> Import CSV</button>
          <button type="button" style={ghostBtn}><Icon name="download" size={13} /> Export</button>
          <button type="button" style={primaryAdmin}><Icon name="user-plus" size={13} /> Invite user</button>
        </div>
      </div>

      {/* Subnav */}
      <div style={{ borderBottom: '1px solid var(--ink-100)', marginBottom: 18, display: 'flex', gap: 4 }}>
        {peopleNav.map(({ id, label, wired }) => {
          const active = id === view
          const count = counts[id]
          const node = (
            <>
              {label}
              {count != null && (
                <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 99, background: active ? 'var(--purple-50)' : 'var(--ink-50, #f3f4f6)', color: active ? 'var(--purple-700)' : 'var(--ink-500)', fontWeight: 700 }}>{count}</span>
              )}
            </>
          )
          const style: React.CSSProperties = {
            padding: '10px 14px', fontSize: 13, fontWeight: active ? 700 : 500,
            color: active ? 'var(--purple-700)' : wired ? 'var(--ink-700)' : 'var(--ink-300)',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            borderBottom: active ? '2px solid var(--purple-700)' : '2px solid transparent',
            marginBottom: -1, cursor: wired ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', fontFamily: 'inherit',
          }
          return wired ? (
            <button key={id} type="button" style={style} onClick={() => { setView(id as ViewId); setPage(1) }}>{node}</button>
          ) : (
            <span key={id} style={style} aria-disabled="true">{node}</span>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <StatTile label="Total users" value={stats.total} />
        <StatTile label="Active" value={stats.active} color="var(--green-600)" />
        <StatTile label="Inactive" value={stats.inactive} color="var(--ink-500)" />
        <StatTile label="Admins" value={stats.admins} color="var(--purple-700)" />
      </div>

      {/* Search + filter chips */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, height: 36 }}>
          <Icon name="search" size={14} color="var(--ink-500)" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search by name, email, department, or role…"
            aria-label="Search users"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-700)', fontFamily: 'inherit' }}
          />
          <span style={{ fontSize: 10.5, padding: '2px 6px', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 4, color: 'var(--ink-500)', fontWeight: 600 }}>⌘K</span>
        </div>
        <Chip label="Role" value="All" />
        <Chip label="Department" value="All" />
        <Chip label="Status" value="All" />
        <Chip label="Joined" value="Anytime" />
      </div>

      {/* Bulk-action bar (appears on selection) */}
      {selected.size > 0 && (
        <div style={{ background: 'var(--purple-50)', border: '1px solid var(--purple-100, #ddd6fe)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Icon name="check-square" size={14} color="var(--purple-700)" />
          <span style={{ fontSize: 12.5, color: 'var(--purple-700)', fontWeight: 600 }}>{selected.size} user{selected.size > 1 ? 's' : ''} selected</span>
          <span style={{ flex: 1 }} />
          <button type="button" style={bulkBtn}>Change role</button>
          <button type="button" style={bulkBtn}>Reassign dept.</button>
          <button type="button" style={{ ...bulkBtn, borderColor: 'var(--rose-600)', color: 'var(--rose-600)' }}>Suspend</button>
          <button type="button" onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: 'var(--ink-500)', padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: tableColumns, padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', alignItems: 'center', gap: 12 }}>
          <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all on this page" />
          <span>User</span>
          <span>Department</span>
          <span>Role</span>
          <span style={{ textAlign: 'right' }}>Requests</span>
          <span>Status</span>
          <span>Last active</span>
          <span />
        </div>

        {isLoading && <div style={{ padding: '24px 16px', fontSize: 13, color: 'var(--ink-500)' }}>Loading users…</div>}
        {!isLoading && rows.length === 0 && (
          <div style={{ padding: '24px 16px', fontSize: 13, color: 'var(--ink-500)' }}>
            {view === 'admin' ? 'No admin accounts found.' : 'No users match your search.'}
          </div>
        )}

        {rows.map((u, i) => (
          <div
            key={u.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/dashboard/people/${u.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/people/${u.id}`) }}
            style={{ display: 'grid', gridTemplateColumns: tableColumns, padding: '13px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12, cursor: 'pointer', background: selected.has(u.id) ? 'var(--purple-50)' : 'transparent' }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.name}`} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 99, background: avatarColor(u.name), color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flex: '0 0 auto' }}>{initials(u.name)}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
              </div>
            </div>
            <span>{u.department_id ? deptName.get(u.department_id) ?? '—' : '—'}</span>
            <span><RoleBadge role={primaryRole(u)} /></span>
            <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>—</span>
            <StatusPill active={u.is_active} />
            <span style={{ color: 'var(--ink-500)' }}>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'never'}</span>
            <Icon name="chevron-right" size={15} color="var(--ink-500)" />
          </div>
        ))}

        {filtered.length > 0 && (
          <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', background: 'var(--paper)' }}>
            <span>Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: current === 1 ? 'default' : 'pointer', opacity: current === 1 ? 0.5 : 1, fontFamily: 'inherit' }}>← Prev</button>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)' }}>{current} / {lastPage}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={current === lastPage} style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 9px', fontSize: 11.5, color: 'var(--ink-700)', cursor: current === lastPage ? 'default' : 'pointer', opacity: current === lastPage ? 0.5 : 1, fontFamily: 'inherit' }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
