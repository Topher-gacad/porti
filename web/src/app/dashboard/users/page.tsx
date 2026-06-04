'use client'

import { useState } from 'react'
import Pagination from '@/components/dashboard/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User, RoleAssignment, ScopeType } from '@/types/models'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type UserPayload,
} from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useAllCompanies } from '@/hooks/useCompanies'
import { useAllBranches } from '@/hooks/useBranches'
import { useAllDepartments } from '@/hooks/useDepartments'
import {
  useRoleAssignments,
  useCreateRoleAssignment,
  useDeleteRoleAssignment,
} from '@/hooks/useRoleAssignments'

// ── AccessProfileModal ────────────────────────────────────────────────────────

const SCOPE_ORDER: ScopeType[] = ['global', 'company', 'branch', 'department']

const SCOPE_CONFIG: Record<ScopeType, { label: string; color: string; headerBg: string }> = {
  global:     { label: 'Global',     color: 'bg-purple-900/40 text-purple-300 border-purple-700',  headerBg: 'bg-purple-900/20' },
  company:    { label: 'Company',    color: 'bg-blue-900/40 text-blue-300 border-blue-700',         headerBg: 'bg-blue-900/20'   },
  branch:     { label: 'Branch',     color: 'bg-green-900/40 text-green-300 border-green-700',      headerBg: 'bg-green-900/20'  },
  department: { label: 'Department', color: 'bg-amber-900/40 text-amber-300 border-amber-700',      headerBg: 'bg-amber-900/20'  },
}

function scopeLabel(
  a: RoleAssignment,
  companies: { id: number; name: string }[],
  branches:  { id: number; name: string }[],
  departments: { id: number; name: string }[],
): string {
  if (a.scope_type === 'global' || a.scope_id === null) return 'All'
  const id = a.scope_id
  switch (a.scope_type) {
    case 'company':    return companies.find(c => c.id === id)?.name    ?? `#${id}`
    case 'branch':     return branches.find(b => b.id === id)?.name     ?? `#${id}`
    case 'department': return departments.find(d => d.id === id)?.name  ?? `#${id}`
  }
}

function AddAssignmentRow({
  scopeType,
  roles,
  scopeOptions,
  onAdd,
  isPending,
  isError,
}: {
  scopeType: ScopeType
  roles: { id: number; name: string }[]
  scopeOptions: { id: number; name: string }[]
  onAdd: (roleId: number, scopeId: number | null) => void
  isPending: boolean
  isError: boolean
}) {
  const [roleId,  setRoleId]  = useState<number | ''>('')
  const [scopeId, setScopeId] = useState<number | ''>('')

  function submit() {
    if (!roleId) return
    onAdd(
      roleId as number,
      scopeType === 'global' ? null : (scopeId || null) as number | null,
    )
    setRoleId('')
    setScopeId('')
  }

  return (
    <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-700/50">
      <div className="flex-1 min-w-[130px]">
        <label className="block text-xs text-slate-500 mb-1">Role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">— pick role —</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {scopeType !== 'global' && (
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs text-slate-500 mb-1 capitalize">{scopeType}</label>
          <select
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">— select —</option>
            {scopeOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!roleId || isPending}
        className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
      >
        {isPending ? '…' : '+ Add'}
      </button>

      {isError && <p className="w-full text-xs text-red-400">Failed to add assignment.</p>}
    </div>
  )
}

function AccessProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data: assignments = [], isLoading } = useRoleAssignments(user.id)
  const create = useCreateRoleAssignment(user.id)
  const remove = useDeleteRoleAssignment(user.id)

  const { data: roles = [] }       = useRoles()
  const { data: companies = [] }   = useAllCompanies()
  const { data: branches = [] }    = useAllBranches()
  const { data: departments = [] } = useAllDepartments()

  const scopeTargetOptions: Record<ScopeType, { id: number; name: string }[]> = {
    global:     [],
    company:    companies,
    branch:     branches,
    department: departments,
  }

  const grouped = SCOPE_ORDER.reduce((acc, s) => {
    acc[s] = assignments.filter((a) => a.scope_type === s)
    return acc
  }, {} as Record<ScopeType, RoleAssignment[]>)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Access Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}

          <p className="text-xs text-slate-500">
            Assignments grant access to specific scopes. A user with a global role has those permissions everywhere.
            Adding a company-scoped assignment also makes that company&apos;s data visible to the user.
          </p>

          {SCOPE_ORDER.map((scopeType) => {
            const cfg    = SCOPE_CONFIG[scopeType]
            const items  = grouped[scopeType] ?? []
            return (
              <div key={scopeType} className="rounded-lg border border-slate-700 overflow-hidden">
                <div className={`px-4 py-2.5 ${cfg.headerBg} border-b border-slate-700`}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {scopeType === 'global' && (
                    <span className="ml-2 text-xs text-slate-500">— permissions apply everywhere</span>
                  )}
                  {scopeType === 'company' && (
                    <span className="ml-2 text-xs text-slate-500">— grants visibility + role within a company</span>
                  )}
                  {scopeType === 'branch' && (
                    <span className="ml-2 text-xs text-slate-500">— grants visibility + role within a branch</span>
                  )}
                  {scopeType === 'department' && (
                    <span className="ml-2 text-xs text-slate-500">— role scoped to a department</span>
                  )}
                </div>

                <div className="px-4 py-3 space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-slate-600 italic">No {cfg.label.toLowerCase()} assignments.</p>
                  )}
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded bg-slate-700/50 border border-slate-600/40"
                    >
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-sm text-slate-200 font-medium">{a.role}</span>
                        {a.scope_type !== 'global' && (
                          <span className="text-xs text-slate-400">
                            · {scopeLabel(a, companies, branches, departments)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove.mutate(a.id)}
                        disabled={remove.isPending}
                        className="text-slate-500 hover:text-red-400 transition-colors text-xs shrink-0"
                        aria-label="Remove"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <AddAssignmentRow
                    scopeType={scopeType}
                    roles={roles}
                    scopeOptions={scopeTargetOptions[scopeType]}
                    onAdd={(roleId, scopeId) =>
                      create.mutate({ role_id: roleId, scope_type: scopeType, scope_id: scopeId })
                    }
                    isPending={create.isPending}
                    isError={create.isError}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-700 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Schema ────────────────────────────────────────────────────────────────────

const userSchema = z.object({
  name:          z.string().min(1, 'Name is required').max(255),
  email:         z.string().email('Must be a valid email').max(255),
  password:      z.string().min(12, 'Password must be at least 12 characters').or(z.literal('')).optional(),
  company_id:    z.number().nullable().optional(),
  branch_id:     z.number().nullable().optional(),
  department_id: z.number().nullable().optional(),
  is_active:     z.boolean().optional(),
  roles:         z.array(z.string()).optional(),
})

type UserFormValues = z.infer<typeof userSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── SelectField ───────────────────────────────────────────────────────────────

function SelectField({
  label, name, value, onChange, options, placeholder = 'None',
}: {
  label: string
  name: string
  value: number | null | undefined
  onChange: (v: number | null) => void
  options: { id: number; name: string }[]
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  )
}

// ── UserFormModal ─────────────────────────────────────────────────────────────

function UserFormModal({ target, onClose }: { target: User | null; onClose: () => void }) {
  const isEdit     = target !== null
  const create     = useCreateUser()
  const update     = useUpdateUser()
  const isPending  = create.isPending || update.isPending

  const { data: roles = [] }       = useRoles()
  const { data: companies = [] }   = useAllCompanies()
  const { data: branches = [] }    = useAllBranches()
  const { data: departments = [] } = useAllDepartments()
  // Role assignments are managed separately via AccessProfileModal

  const { register, handleSubmit, control, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name:          target?.name          ?? '',
      email:         target?.email         ?? '',
      password:      '',
      company_id:    target?.company_id    ?? null,
      branch_id:     target?.branch_id     ?? null,
      department_id: target?.department_id ?? null,
      is_active:     target?.is_active     ?? true,
      roles:         target?.roles         ?? [],
    },
  })

  async function onSubmit(values: UserFormValues) {
    const payload: UserPayload = {
      name:          values.name,
      email:         values.email,
      company_id:    values.company_id    ?? null,
      branch_id:     values.branch_id     ?? null,
      department_id: values.department_id ?? null,
    }

    if (values.password) payload.password = values.password

    if (isEdit) {
      payload.is_active = values.is_active
      await update.mutateAsync({ id: target.id, payload })
    } else {
      // On create, simple roles → saved as company-scoped assignments by the API
      payload.roles = values.roles ?? []
      await create.mutateAsync(payload)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-base font-semibold text-slate-100">
            {isEdit ? 'Edit User' : 'New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name')}
                className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Full name"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="user@comfac.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Password
                <span className="text-slate-500 font-normal ml-1">
                  {isEdit ? '(leave blank to keep current)' : '(leave blank — SSO users sign in via Authentik)'}
                </span>
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Min. 12 characters"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Controller
                name="company_id"
                control={control}
                render={({ field }) => (
                  <SelectField label="Company" name="company_id" value={field.value} onChange={field.onChange} options={companies} />
                )}
              />
            </div>

            <div>
              <Controller
                name="branch_id"
                control={control}
                render={({ field }) => (
                  <SelectField label="Branch" name="branch_id" value={field.value} onChange={field.onChange} options={branches} />
                )}
              />
            </div>

            <div className="col-span-2">
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <SelectField label="Department" name="department_id" value={field.value} onChange={field.onChange} options={departments} />
                )}
              />
            </div>
          </div>

          {/* Role section: simple checkboxes for create, scoped panel for edit */}
          {!isEdit && roles.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Initial Roles
                <span className="text-slate-500 font-normal ml-1">(saved as company-scoped assignments)</span>
              </label>
              <Controller
                name="roles"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => {
                      const checked = (field.value ?? []).includes(role.name)
                      return (
                        <label
                          key={role.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer text-xs font-medium border transition-colors ${
                            checked
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              const current = field.value ?? []
                              field.onChange(
                                checked
                                  ? current.filter((r) => r !== role.name)
                                  : [...current, role.name],
                              )
                            }}
                          />
                          {role.name}
                        </label>
                      )
                    })}
                  </div>
                )}
              />
            </div>
          )}

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
            <p className="text-xs text-red-400">Failed to save. Check the values and try again.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
            >
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ user, onClose }: { user: User; onClose: () => void }) {
  const del = useDeleteUser()

  async function handleDelete() {
    await del.mutateAsync(user.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h2 className="text-base font-semibold text-slate-100 mb-2">Delete user?</h2>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{user.name}</strong> ({user.email}) will be permanently
          deleted. This cannot be undone.
        </p>
        {del.isError && (
          <p className="text-xs text-red-400 mb-3">
            Failed to delete. The user may have dependent records.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
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

// ── UsersPage ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [page, setPage]               = useState(1)
  const [formTarget, setFormTarget]   = useState<User | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [accessTarget, setAccessTarget] = useState<User | null>(null)

  const { data, isLoading, isError } = useUsers(page)
  const { can, hasAnyRole } = usePermissions()

  const canManageAccess = can('assign-roles') || hasAnyRole('super-admin', 'developer')

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Users</h1>
          {data && <p className="text-xs text-slate-400 mt-0.5">{data.meta.total} total</p>}
        </div>
        {(can('create-users') || can('manage-users')) && (
          <button
            onClick={() => setFormTarget(null)}
            className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            + New user
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError   && <p className="text-sm text-red-400">Failed to load users.</p>}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  {['Name', 'Email', 'Roles', 'Last login', 'Status', ''].map((h) => (
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
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-200 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.length ? (
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {(can('manage-users') || can('update-users') || can('delete-users') || canManageAccess) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {canManageAccess && (
                            <button
                              onClick={() => setAccessTarget(user)}
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              Access
                            </button>
                          )}
                          {(can('update-users') || can('manage-users')) && (
                            <button
                              onClick={() => setFormTarget(user)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {(can('delete-users') || can('manage-users')) && (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
        <UserFormModal target={formTarget} onClose={() => setFormTarget(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
      {accessTarget && (
        <AccessProfileModal user={accessTarget} onClose={() => setAccessTarget(null)} />
      )}
    </div>
  )
}
