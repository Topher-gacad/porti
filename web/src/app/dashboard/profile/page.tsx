'use client'

import Icon from '@/components/Icon'
import { useMe, type MeRoleAssignment } from '@/hooks/useMe'

/*
 * "My profile" — the signed-in user's own account, read-only, sourced from GET /me.
 *
 * Not in the handoff (no profile frame exists), so this is extrapolated from the
 * people-detail design language. Resource matrix adapted to the real RBAC:
 * View = tenant scope, create/update/delete = named permissions, Approve = N/A.
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

export default function MyProfilePage() {
  const { data: me, isLoading, isError } = useMe()

  if (isLoading) return <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading your profile…</div>
  if (isError || !me) return <div style={{ fontSize: 13, color: 'var(--rose-600)' }}>Could not load your profile.</div>

  const roleNames = me.roles
  const privileged = roleNames.some((r) => r === 'super-admin' || r === 'developer')
  const perms = new Set(me.permissions)
  const has = (perm: string) => privileged || perms.has(perm)
  const cellGranted = (resourceKey: string, action: ActionKey, available: boolean) => {
    if (!available) return false
    if (action === 'view') return true
    if (action === 'approve') return false
    return has(`${action}-${resourceKey}`) || has(`manage-${resourceKey}`)
  }
  const grantedCount = RESOURCES.reduce((n, r) => n + ACTIONS.filter((a) => cellGranted(r.key, a, r.avail[a])).length, 0)

  const assignments = me.role_assignments
  const assignmentRoleNames = new Set(assignments.map((a) => a.role))
  const flatOnlyRoles = me.roles.filter((r) => !assignmentRoleNames.has(r))

  function scopeLabel(a: MeRoleAssignment): string {
    if (!me) return ''
    if (a.scope_type === 'global' || a.scope_id == null) return 'Global'
    if (a.scope_type === 'company') return me.company && a.scope_id === me.company.id ? `Company: ${me.company.name}` : `Company #${a.scope_id}`
    if (a.scope_type === 'branch') return me.branch && a.scope_id === me.branch.id ? `Branch: ${me.branch.name}` : `Branch #${a.scope_id}`
    return me.department && a.scope_id === me.department.id ? `Department: ${me.department.name}` : `Department #${a.scope_id}`
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>My profile</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>Your account, roles, and access. Read-only — contact an administrator to change it.</div>
      </div>

      {/* Header card */}
      <div style={{ ...card, borderRadius: 14, padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 64, height: 64, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flex: '0 0 auto' }}>
          {initials(me.name)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.5 }}>{me.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: me.is_active ? 'var(--green-50)' : 'var(--ink-50, #f3f4f6)', color: me.is_active ? 'var(--green-600)' : 'var(--ink-500)' }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: me.is_active ? 'var(--green-600)' : 'var(--ink-300)' }} />
              {me.is_active ? 'Active' : 'Inactive'}
            </span>
            {roleNames[0] && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', background: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: 99 }}>{roleNames[0]}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--ink-500)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="mail" size={12} color="var(--ink-500)" /> {me.email}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={12} color="var(--ink-500)" /> {me.last_login_at ? `Last seen ${new Date(me.last_login_at).toLocaleString()}` : 'Never signed in'}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        <div>
          {/* Scope */}
          <div style={{ ...card, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Scope</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1, marginBottom: 14 }}>Where in the org you sit. Your role permissions apply within this scope.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { ic: 'building', label: 'Company', value: me.company?.name ?? 'Not assigned' },
                { ic: 'git-branch', label: 'Branch', value: me.branch?.name ?? 'All branches' },
                { ic: 'users', label: 'Department', value: me.department?.name ?? 'None' },
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

          {/* Roles */}
          <div style={{ ...card, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Your roles</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1, marginBottom: 12 }}>Roles bundle permissions. The matrix below is the merged result.</div>
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
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Your permissions</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>What you can do per resource. View follows tenant scope; create/update/delete come from roles.</div>
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
            <InfoRow label="User ID">{`USR-${String(me.id).padStart(5, '0')}`}</InfoRow>
            <InfoRow label="Status">{me.is_active ? 'Active' : 'Inactive'}</InfoRow>
            <InfoRow label="Joined">{me.created_at ? new Date(me.created_at).toLocaleDateString() : '—'}</InfoRow>
            <InfoRow label="Last sign-in">{me.last_login_at ? new Date(me.last_login_at).toLocaleString() : 'Never'}</InfoRow>
            <InfoRow label="SSO ID">{me.authentik_uid ?? '—'}</InfoRow>
          </div>

          <div style={{ ...card, padding: 16 }}>
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
        </div>
      </div>
    </>
  )
}
