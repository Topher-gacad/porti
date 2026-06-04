'use client'

import { useState } from 'react'
import Pagination from '@/components/dashboard/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Company } from '@/types/models'
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  type CompanyPayload,
} from '@/hooks/useCompanies'
import { useAllBranches } from '@/hooks/useBranches'
import { useAllUsers } from '@/hooks/useUsers'
import { useAllTeams } from '@/hooks/useTeams'
import {
  useBranchAccessGrants,
  useCreateBranchAccessGrant,
  useRevokeBranchAccessGrant,
} from '@/hooks/useBranchAccessGrants'

const companySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
})

type FormValues = z.infer<typeof companySchema>

// ── CompanyFormModal ──────────────────────────────────────────────────────────

function CompanyFormModal({ target, onClose }: { target: Company | null; onClose: () => void }) {
  const isEdit    = target !== null
  const create    = useCreateCompany()
  const update    = useUpdateCompany()
  const isPending = create.isPending || update.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name:      target?.name      ?? '',
      code:      target?.code      ?? '',
      logo:      target?.logo      ?? '',
      is_active: target?.is_active ?? true,
    },
  })

  async function onSubmit(values: FormValues) {
    const payload: CompanyPayload = {
      name:      values.name,
      code:      values.code,
      logo:      values.logo || null,
      is_active: values.is_active,
    }
    if (isEdit) {
      await update.mutateAsync({ id: target.id, payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-slate-100">
            {isEdit ? 'Edit Company' : 'New Company'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Comfac Corporation"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Code <span className="text-red-400">*</span>
            </label>
            <input
              {...register('code')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
              placeholder="COMFAC"
            />
            {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Logo URL</label>
            <input
              {...register('logo')}
              type="url"
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://example.com/logo.png"
            />
            {errors.logo && <p className="text-xs text-red-400 mt-1">{errors.logo.message}</p>}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
            </div>
          )}

          {(create.isError || update.isError) && (
            <p className="text-xs text-red-400">Failed to save. Please check the values and try again.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
            >
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const del = useDeleteCompany()

  async function handleDelete() {
    await del.mutateAsync(company.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h2 className="text-base font-semibold text-slate-100 mb-2">Delete company?</h2>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{company.name}</strong> will be permanently deleted. This action cannot be undone.
        </p>
        {del.isError && (
          <p className="text-xs text-red-400 mb-3">Failed to delete. The company may have dependent records.</p>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={del.isPending}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded transition-colors"
          >
            {del.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CompanySettingsModal ──────────────────────────────────────────────────────

function CompanySettingsModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const update = useUpdateCompany()
  const { data: grants = [], isLoading: grantsLoading } = useBranchAccessGrants(company.id)
  const create = useCreateBranchAccessGrant(company.id)
  const revoke = useRevokeBranchAccessGrant(company.id)

  const { data: allBranches = [] } = useAllBranches()
  const { data: allUsers = [] }    = useAllUsers()
  const { data: allTeams = [] }    = useAllTeams()

  // Filter to branches/users/teams belonging to this company
  const companyBranches = allBranches.filter((b) => b.company_id === company.id)
  const companyUsers    = allUsers.filter((u) => u.company_id === company.id)
  const companyTeams    = allTeams.filter((t) => t.company_id === company.id)

  const [granteeType, setGranteeType]   = useState<'user' | 'team'>('user')
  const [branchId, setBranchId]         = useState<number | ''>('')
  const [granteeId, setGranteeId]       = useState<number | ''>('')
  const [reason, setReason]             = useState('')
  const [validUntil, setValidUntil]     = useState('')

  async function toggleIsolation() {
    await update.mutateAsync({
      id: company.id,
      payload: { enforce_branch_isolation: !company.enforce_branch_isolation },
    })
  }

  async function handleAddGrant() {
    if (!branchId || !granteeId) return
    await create.mutateAsync({
      branch_id:    branchId as number,
      grantee_type: granteeType,
      grantee_id:   granteeId as number,
      reason:       reason || null,
      valid_until:  validUntil || null,
    })
    setBranchId('')
    setGranteeId('')
    setReason('')
    setValidUntil('')
  }

  const granteeOptions = granteeType === 'user'
    ? companyUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))
    : companyTeams.map((t) => ({ value: t.id, label: t.name }))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Access Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">{company.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">

          {/* Branch Isolation Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Branch data isolation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  When enabled, users only see data from their own branch unless explicitly granted access to others.
                </p>
              </div>
              <button
                onClick={toggleIsolation}
                disabled={update.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 ${
                  company.enforce_branch_isolation ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
                role="switch"
                aria-checked={company.enforce_branch_isolation}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    company.enforce_branch_isolation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {company.enforce_branch_isolation && (
              <p className="text-xs text-amber-400 mt-2">
                Isolation is active. Users assigned to a branch can only see that branch&apos;s data. Company-level users (no branch) are unaffected.
              </p>
            )}
          </div>

          {/* Branch Access Grants */}
          <div className="border-t border-slate-700 pt-5">
            <p className="text-sm font-medium text-slate-200 mb-1">Branch access grants</p>
            <p className="text-xs text-slate-500 mb-3">
              Grant specific users or teams cross-branch visibility, regardless of the isolation setting.
            </p>

            {grantsLoading && <p className="text-sm text-slate-400">Loading…</p>}

            {!grantsLoading && grants.filter(g => g.is_active).length === 0 && (
              <p className="text-xs text-slate-500 italic mb-3">No grants yet.</p>
            )}

            <div className="space-y-1.5 max-h-40 overflow-y-auto mb-4">
              {grants.filter(g => g.is_active).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded bg-slate-700/50 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-slate-200 font-medium">{g.branch?.name ?? '—'}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="capitalize text-slate-400">{g.grantee_type} #{g.grantee_id}</span>
                    {g.reason && <span className="text-slate-500 ml-1">({g.reason})</span>}
                    {g.valid_until && (
                      <span className="text-slate-600 ml-1">
                        expires {new Date(g.valid_until).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => revoke.mutate(g.id)}
                    disabled={revoke.isPending}
                    className="text-red-400 hover:text-red-300 shrink-0 transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>

            {/* Add Grant Form */}
            <div className="space-y-3 bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-400">Add cross-branch access</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">— select branch —</option>
                    {companyBranches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Grant to</label>
                  <div className="flex gap-1">
                    <select
                      value={granteeType}
                      onChange={(e) => { setGranteeType(e.target.value as 'user' | 'team'); setGranteeId('') }}
                      className="rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="team">Team</option>
                    </select>
                    <select
                      value={granteeId}
                      onChange={(e) => setGranteeId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex-1 rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">— select —</option>
                      {granteeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Temporary project access"
                    className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Expires (optional)</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {create.isError && (
                <p className="text-xs text-red-400">
                  {(create.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create grant.'}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleAddGrant}
                  disabled={!branchId || !granteeId || create.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {create.isPending ? 'Adding…' : 'Add grant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CompaniesPage ─────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [page, setPage]               = useState(1)
  const [formTarget, setFormTarget]   = useState<Company | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)
  const [settingsTarget, setSettingsTarget] = useState<Company | null>(null)

  const { data, isLoading, isError } = useCompanies(page)
  const { can, hasAnyRole } = usePermissions()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Companies</h1>
          {data && <p className="text-xs text-slate-400 mt-0.5">{data.meta.total} total</p>}
        </div>
        {hasAnyRole('super-admin', 'developer') && (
          <button
            onClick={() => setFormTarget(null)}
            className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            + New company
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError   && <p className="text-sm text-red-400">Failed to load companies.</p>}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  {['Name', 'Code', 'Status', 'Branch Isolation', 'Created', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-700">
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">No companies yet.</td>
                  </tr>
                )}
                {data.data.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-200 font-medium">{company.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">{company.code}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        company.is_active ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        company.enforce_branch_isolation
                          ? 'bg-indigo-900/50 text-indigo-400'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}>
                        {company.enforce_branch_isolation ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {can('manage-company') && (
                          <button
                            onClick={() => setSettingsTarget(company)}
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Settings
                          </button>
                        )}
                        {can('manage-company') && (
                          <button
                            onClick={() => setFormTarget(company)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {hasAnyRole('super-admin', 'developer') && (
                          <button
                            onClick={() => setDeleteTarget(company)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
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

      {formTarget !== undefined && (
        <CompanyFormModal target={formTarget} onClose={() => setFormTarget(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal company={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
      {settingsTarget && (
        <CompanySettingsModal company={settingsTarget} onClose={() => setSettingsTarget(null)} />
      )}
    </div>
  )
}
