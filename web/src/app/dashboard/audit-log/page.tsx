'use client'

import { useState } from 'react'
import Pagination from '@/components/dashboard/Pagination'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import type { AuditLogFilters } from '@/hooks/useAuditLogs'

const ACTION_OPTIONS = [
  { value: '',                    label: 'All actions' },
  { value: 'user.created',        label: 'User created' },
  { value: 'user.updated',        label: 'User updated' },
  { value: 'user.deleted',        label: 'User deleted' },
  { value: 'branch.created',      label: 'Branch created' },
  { value: 'branch.updated',      label: 'Branch updated' },
  { value: 'branch.deleted',      label: 'Branch deleted' },
  { value: 'department.created',  label: 'Department created' },
  { value: 'department.updated',  label: 'Department updated' },
  { value: 'department.deleted',  label: 'Department deleted' },
  { value: 'team.created',        label: 'Team created' },
  { value: 'team.updated',        label: 'Team updated' },
  { value: 'team.deleted',        label: 'Team deleted' },
  { value: 'company.updated',     label: 'Company updated' },
  { value: 'role.assigned',       label: 'Role assigned' },
  { value: 'role.revoked',        label: 'Role revoked' },
  { value: 'role.created',        label: 'Role created' },
  { value: 'role.updated',        label: 'Role updated' },
  { value: 'role.deleted',        label: 'Role deleted' },
  { value: 'team.member.added',   label: 'Team member added' },
  { value: 'team.member.removed', label: 'Team member removed' },
  { value: 'auth.local.success',              label: 'Signed in' },
  { value: 'auth.local.failed',               label: 'Login failed' },
  { value: 'auth.sso.failed',                 label: 'SSO failed' },
  { value: 'branch.access.granted',           label: 'Branch access granted' },
  { value: 'branch.access.revoked',           label: 'Branch access revoked' },
  { value: 'company.branch_isolation.enabled',  label: 'Branch isolation enabled' },
  { value: 'company.branch_isolation.disabled', label: 'Branch isolation disabled' },
]

const ACTION_COLORS: Record<string, string> = {
  'user.created':       'text-green-400',
  'user.deleted':       'text-red-400',
  'branch.deleted':     'text-red-400',
  'department.deleted': 'text-red-400',
  'team.deleted':       'text-red-400',
  'role.assigned':      'text-indigo-400',
  'role.revoked':       'text-amber-400',
  'role.created':       'text-green-400',
  'role.updated':       'text-slate-300',
  'role.deleted':       'text-red-400',
  'auth.local.failed':  'text-red-400',
  'auth.sso.failed':    'text-red-400',
  'team.member.added':                    'text-green-400',
  'team.member.removed':                  'text-amber-400',
  'branch.access.granted':                'text-green-400',
  'branch.access.revoked':                'text-red-400',
  'company.branch_isolation.enabled':     'text-indigo-400',
  'company.branch_isolation.disabled':    'text-amber-400',
}

function PayloadCell({ payload }: { payload: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false)
  if (!payload || Object.keys(payload).length === 0) return <span className="text-slate-600">—</span>

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {open ? 'hide' : 'details'}
      </button>
      {open && (
        <pre className="mt-1 text-xs text-slate-400 bg-slate-900 rounded p-2 max-w-xs overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function AuditLogPage() {
  const [page,   setPage]   = useState(1)
  const [action, setAction] = useState('')
  const [from,   setFrom]   = useState('')
  const [to,     setTo]     = useState('')

  const filters: AuditLogFilters = { page }
  if (action) filters.action = action
  if (from)   filters.from   = from
  if (to)     filters.to     = to

  const { data, isLoading, isError } = useAuditLogs(filters)

  function resetFilters() {
    setAction('')
    setFrom('')
    setTo('')
    setPage(1)
  }

  const filtersActive = !!(action || from || to)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Audit Log</h1>
          {data && (
            <p className="text-xs text-slate-400 mt-0.5">{data.meta.total} entries</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1) }}
          className="rounded bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1) }}
          className="rounded bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="From"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1) }}
          className="rounded bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="To"
        />

        {filtersActive && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError   && <p className="text-sm text-red-400">Failed to load audit log.</p>}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  {['When', 'Who', 'Action', 'Target', 'Details'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-700">
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                      No entries found.
                    </td>
                  </tr>
                )}
                {data.data.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry.actor ? (
                        <div>
                          <p className="text-slate-200 text-xs font-medium">{entry.actor.name}</p>
                          <p className="text-slate-500 text-xs">{entry.actor.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${ACTION_COLORS[entry.action] ?? 'text-slate-300'}`}>
                        {entry.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {entry.target_type && entry.target_id ? (
                        <span className="capitalize">{entry.target_type} <span className="text-slate-600">#{entry.target_id}</span></span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PayloadCell payload={entry.payload} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            total={data.meta.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
