'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Icon from '@/components/Icon'
import { useUser } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useAllCompanies } from '@/hooks/useCompanies'
import { useAllBranches } from '@/hooks/useBranches'
import { useAllDepartments } from '@/hooks/useDepartments'
import type { RoleAssignment } from '@/types/models'

/*
 * People · user detail — wired to the real user, design preserved.
 *
 * The design's matrix is service-desk modules × View/Create/Update/Delete/Approve with
 * per-user overrides; this backend's RBAC is named permissions per resource. Adapted:
 * rows are the real resources, View = tenant scope (viewAny), create/update/delete map
 * to named permissions (union of the user's role permissions), Approve = not available.
 */

type ActionKey = 'view' | 'create' | 'update' | 'delete' | 'approve'

const RESOURCES: { key: string; label: string; desc: string; avail: Record<ActionKey, boolean> }[] = [
  { key: 'users', label: 'Users', desc: 'Portal users & role assignments', avail: { view: true, create: true, update: true, delete: true, approve: false } },
  { key: 'branches', label: 'Branches', desc: 'Company branch locations', avail: { view: true, create: true, update: true, delete: true, approve: false } },
  { key: 'departments', label: 'Departments', desc: 'Departments within branches', avail: { view: true, create: true, update: true, delete: true, approve: false } },
  { key: 'teams', label: 'Teams', desc: 'Teams & their members', avail: { view: true, create: true, update: true, delete: true, approve: false } },
  { key: 'company', label: 'Company', desc: 'Company profile & settings', avail: { view: true, create: false, update: true, delete: false, approve: false } },
]
const ACTIONS: ActionKey[] = ['view', 'create', 'update', 'delete', 'approve']
const MATRIX_COLS = 'minmax(0,2fr) repeat(5,minmax(44px,1fr)) 64px'

const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12 }
const ghostBtn: React.CSSProperties = { background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }
const primaryBtn: React.CSSProperties = { background: 'var(--ink-900)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'
}

function PermCell({ granted, available }: { granted: boolean; available: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 22, height: 22, borderRadius: 6,
          background: !available ? 'var(--ink-50, #f3f4f6)' : granted ? 'var(--purple-50)' : 'var(--card)',
          border: '1px solid ' + (!available ? 'var(--ink-200)' : granted ? 'var(--purple-200, #c4b5fd)' : 'var(--ink-200)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: available ? 1 : 0.5,
        }}
      >
        {available && granted && <Icon name="check" size={12} color="var(--purple-700)" />}
        {!available && <Icon name="lock" size={10} color="var(--ink-500)" />}
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ink-100)', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{label}</span>
      <div style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 500 }}>{children}</div>
    </div>
  )
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)

  const { data: user, isLoading, isError } = useUser(id)
  const { data: roles } = useRoles()
  const { data: companies } = useAllCompanies()
  const { data: branches } = useAllBranches()
  const { data: departments } = useAllDepartments()

  const names = useMemo(() => ({
    company: new Map((companies ?? []).map((c) => [c.id, c.name])),
    branch: new Map((branches ?? []).map((b) => [b.id, b.name])),
    department: new Map((departments ?? []).map((d) => [d.id, d.name])),
  }), [companies, branches, departments])

  const { roleNames, privileged, effective } = useMemo(() => {
    const ras = user?.role_assignments ?? []
    const flat = user?.roles ?? []
    const rNames = Array.from(new Set([...flat, ...ras.map((a) => a.role)]))
    const priv = rNames.some((r) => r === 'super-admin' || r === 'developer')
    const set = new Set<string>()
    for (const rn of rNames) roles?.find((r) => r.name === rn)?.permissions?.forEach((p) => set.add(p))
    return { roleNames: rNames, privileged: priv, effective: set }
  }, [user, roles])

  const has = (perm: string) => privileged || effective.has(perm)
  const cellGranted = (resourceKey: string, action: ActionKey, available: boolean) => {
    if (!available) return false
    if (action === 'view') return true
    if (action === 'approve') return false
    return has(`${action}-${resourceKey}`) || has(`manage-${resourceKey}`)
  }
  const grantedCount = RESOURCES.reduce((n, r) => n + ACTIONS.filter((a) => cellGranted(r.key, a, r.avail[a])).length, 0)

  function scopeLabel(a: RoleAssignment): string {
    if (a.scope_type === 'global' || a.scope_id == null) return 'Global'
    const map = a.scope_type === 'company' ? names.company : a.scope_type === 'branch' ? names.branch : names.department
    return `${a.scope_type[0].toUpperCase()}${a.scope_type.slice(1)}: ${map.get(a.scope_id) ?? `#${a.scope_id}`}`
  }

  if (isLoading) return <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading user…</div>
  if (isError || !user) {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>User not found</div>
        <Link href="/dashboard/people" style={{ fontSize: 13, color: 'var(--purple-700)', fontWeight: 600 }}>← Back to People</Link>
      </div>
    )
  }

  const assignments = user.role_assignments ?? []
  const assignmentRoleNames = new Set(assignments.map((a) => a.role))
  const flatOnlyRoles = (user.roles ?? []).filter((r) => !assignmentRoleNames.has(r))

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>
        <Link href="/dashboard/people" style={{ color: 'var(--ink-500)' }}>People</Link>
        <Icon name="chevron-right" size={11} color="var(--ink-500)" />
        <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{user.name}</span>
      </div>

      {/* Header card */}
      <div style={{ ...card, borderRadius: 14, padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 64, height: 64, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flex: '0 0 auto' }}>
          {initials(user.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.5 }}>{user.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: user.is_active ? 'var(--green-50)' : 'var(--ink-50, #f3f4f6)', color: user.is_active ? 'var(--green-600)' : 'var(--ink-500)' }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: user.is_active ? 'var(--green-600)' : 'var(--ink-300)' }} />
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
            {roleNames[0] && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', background: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: 99 }}>{roleNames[0]}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--ink-500)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="mail" size={12} color="var(--ink-500)" /> {user.email}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={12} color="var(--ink-500)" /> {user.last_login_at ? `Last seen ${new Date(user.last_login_at).toLocaleDateString()}` : 'Never signed in'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={ghostBtn}><Icon name="key" size={13} color="var(--ink-700)" /> Reset password</button>
          <button type="button" style={ghostBtn}>Message</button>
          <button type="button" style={primaryBtn}>Edit profile</button>
        </div>
      </div>

      {/* Sub-tabs (only Access & Permissions is implemented) */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ink-100)', marginBottom: 16 }}>
        {['Overview', 'Access & Permissions', 'Activity', 'Devices & Sessions', 'Audit log'].map((t) => {
          const active = t === 'Access & Permissions'
          return (
            <span key={t} style={{ padding: '9px 14px', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--purple-700)' : 'var(--ink-500)', borderBottom: active ? '2px solid var(--purple-700)' : '2px solid transparent', marginBottom: -1 }} aria-disabled={!active}>{t}</span>
          )
        })}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        <div>
          {/* Scope */}
          <div style={{ ...card, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Scope</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1, marginBottom: 14 }}>Where in the org this user sits. Their role permissions apply within this scope.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { ic: 'building', label: 'Company', value: user.company_id ? names.company.get(user.company_id) ?? `#${user.company_id}` : 'Not assigned' },
                { ic: 'git-branch', label: 'Branch', value: user.branch_id ? names.branch.get(user.branch_id) ?? `#${user.branch_id}` : 'All branches' },
                { ic: 'users', label: 'Department', value: user.department_id ? names.department.get(user.department_id) ?? `#${user.department_id}` : 'None' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 5 }}>
                    <Icon name={s.ic} size={11} color="var(--ink-500)" /> {s.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned roles */}
          <div style={{ ...card, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Assigned roles</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1, marginBottom: 12 }}>Roles bundle permissions. The matrix below is the merged result across all roles.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {assignments.length === 0 && flatOnlyRoles.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>No roles assigned.</span>}
              {assignments.map((a) => (
                <div key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={11} color="#fff" /></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>{a.role}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>· {scopeLabel(a)}</span>
                </div>
              ))}
              {flatOnlyRoles.map((r) => (
                <div key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={11} color="#fff" /></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>{r}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>· Global</span>
                </div>
              ))}
            </div>
          </div>

          {/* Permission matrix */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Resource permissions</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>What this user can do per resource. View follows tenant scope; create/update/delete come from roles.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--ink-500)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--purple-50)', border: '1px solid var(--purple-200, #c4b5fd)' }} /> Granted</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--ink-50, #f3f4f6)', border: '1px solid var(--ink-200)' }} /> Not available</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, padding: '10px 18px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--paper)' }}>
              <span>Resource</span>
              <span style={{ textAlign: 'center' }}>View</span>
              <span style={{ textAlign: 'center' }}>Create</span>
              <span style={{ textAlign: 'center' }}>Update</span>
              <span style={{ textAlign: 'center' }}>Delete</span>
              <span style={{ textAlign: 'center' }}>Approve</span>
              <span style={{ textAlign: 'right' }}>Source</span>
            </div>

            {RESOURCES.map((r, i) => {
              const cudGranted = (['create', 'update', 'delete'] as ActionKey[]).some((a) => cellGranted(r.key, a, r.avail[a]))
              return (
                <div key={r.key} style={{ display: 'grid', gridTemplateColumns: MATRIX_COLS, padding: '12px 18px', borderBottom: i < RESOURCES.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.desc}</div>
                  </div>
                  {ACTIONS.map((a) => (
                    <PermCell key={a} available={r.avail[a]} granted={cellGranted(r.key, a, r.avail[a])} />
                  ))}
                  <span style={{ textAlign: 'right', fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600 }}>{cudGranted ? 'Role' : 'Scope'}</span>
                </div>
              )
            })}

            <div style={{ padding: '12px 18px', background: 'var(--paper)', fontSize: 12, color: 'var(--ink-500)' }}>
              {privileged ? 'Privileged role — full access to every resource.' : 'View is granted by tenant scope; create/update/delete come from roles. Approve isn’t modeled in this system yet.'}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div>
          <div style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 6 }}>Account</div>
            <InfoRow label="User ID">{`USR-${String(user.id).padStart(5, '0')}`}</InfoRow>
            <InfoRow label="Status">{user.is_active ? 'Active' : 'Inactive'}</InfoRow>
            <InfoRow label="Joined">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</InfoRow>
            <InfoRow label="Last sign-in">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</InfoRow>
            <InfoRow label="SSO ID">{user.authentik_uid ?? '—'}</InfoRow>
          </div>

          <div style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>Access summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                [String(roleNames.length), 'roles', 'var(--purple-700)'],
                [String(grantedCount), 'permissions', 'var(--ink-900)'],
                [String(assignments.length), 'scopes', 'var(--orange-600)'],
                [privileged ? 'Full' : 'Scoped', 'access', 'var(--green-600)'],
              ].map(([v, l, c]) => (
                <div key={l} style={{ background: 'var(--paper)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c, letterSpacing: -0.3 }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 12 }}>Role assignments</div>
            {assignments.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>None.</div>}
            {assignments.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < assignments.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--purple-700)', marginTop: 6, flex: '0 0 auto' }} />
                <div style={{ fontSize: 12, flex: 1 }}>
                  <div style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{a.role}</div>
                  <div style={{ color: 'var(--ink-500)', marginTop: 1 }}>{scopeLabel(a)}</div>
                  {a.created_at && <div style={{ color: 'var(--ink-500)', marginTop: 3, fontSize: 11 }}>{new Date(a.created_at).toLocaleDateString()}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
