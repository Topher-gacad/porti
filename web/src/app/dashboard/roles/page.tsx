'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { Role } from '@/types/models'
import {
  useRoles,
  useAvailablePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles'

// Permissions grouped by resource for the matrix UI
const PERMISSION_GROUPS = [
  { label: 'Users',       actions: ['create-users',       'update-users',       'delete-users']       },
  { label: 'Branches',    actions: ['create-branches',    'update-branches',    'delete-branches']    },
  { label: 'Departments', actions: ['create-departments', 'update-departments', 'delete-departments'] },
  { label: 'Teams',       actions: ['create-teams',       'update-teams',       'delete-teams']       },
  { label: 'Company',     actions: ['update-company']                                                 },
  { label: 'Access',      actions: ['assign-roles']                                                   },
]

const ACTION_LABELS: Record<string, string> = {
  'create-users':       'Create',
  'update-users':       'Update',
  'delete-users':       'Delete',
  'create-branches':    'Create',
  'update-branches':    'Update',
  'delete-branches':    'Delete',
  'create-departments': 'Create',
  'update-departments': 'Update',
  'delete-departments': 'Delete',
  'create-teams':       'Create',
  'update-teams':       'Update',
  'delete-teams':       'Delete',
  'update-company':     'Update',
  'assign-roles':       'Assign',
}

// ── PermissionMatrix ──────────────────────────────────────────────────────────

function PermissionMatrix({
  selected,
  onChange,
  readonly = false,
}: {
  selected: string[]
  onChange?: (perms: string[]) => void
  readonly?: boolean
}) {
  function toggle(perm: string) {
    if (readonly || !onChange) return
    const next = selected.includes(perm)
      ? selected.filter((p) => p !== perm)
      : [...selected, perm]
    onChange(next)
  }

  return (
    <div className="space-y-1">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label} className="flex items-center gap-2">
          <span className="w-28 text-xs text-slate-400 shrink-0">{group.label}</span>
          <div className="flex gap-1.5 flex-wrap">
            {group.actions.map((perm) => {
              const active = selected.includes(perm)
              return (
                <button
                  key={perm}
                  type="button"
                  onClick={() => toggle(perm)}
                  disabled={readonly}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
                  } disabled:cursor-default`}
                >
                  {ACTION_LABELS[perm] ?? perm}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── RoleFormModal ─────────────────────────────────────────────────────────────

function RoleFormModal({ target, onClose }: { target: Role | null; onClose: () => void }) {
  const isEdit = target !== null
  const create = useCreateRole()
  const update = useUpdateRole()
  const isPending = create.isPending || update.isPending

  const [name, setName]           = useState(target?.name ?? '')
  const [perms, setPerms]         = useState<string[]>(target?.permissions ?? [])
  const [nameError, setNameError] = useState('')

  async function handleSubmit() {
    if (!name.trim()) { setNameError('Name is required'); return }
    setNameError('')

    if (isEdit) {
      await update.mutateAsync({ id: target.id, payload: { permissions: perms } })
    } else {
      await create.mutateAsync({ name: name.trim(), permissions: perms })
    }
    onClose()
  }

  const isLocked = target?.is_locked ?? false

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-slate-100">
            {isEdit ? 'Edit Role' : 'New Role'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Role name {!isEdit && <span className="text-red-400">*</span>}
            </label>
            {isEdit ? (
              <p className="text-sm text-slate-200">
                {target.name}
                {target.is_system && (
                  <span className="ml-2 text-xs text-slate-500">(system role — name cannot be changed)</span>
                )}
              </p>
            ) : (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. content-editor"
                />
                {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
              </>
            )}
          </div>

          {/* Permission matrix */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-3">Permissions</label>
            {isLocked ? (
              <p className="text-xs text-slate-500 italic">This role is locked and cannot be modified.</p>
            ) : (
              <PermissionMatrix selected={perms} onChange={setPerms} />
            )}
          </div>

          {(create.isError || update.isError) && (
            <p className="text-xs text-red-400">Failed to save. The role name may already exist.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
            Cancel
          </button>
          {!isLocked && (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
            >
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create role'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const del = useDeleteRole()

  async function handleDelete() {
    await del.mutateAsync(role.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h2 className="text-base font-semibold text-slate-100 mb-2">Delete role?</h2>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{role.name}</strong> will be permanently deleted.
          Users currently assigned this role will lose its permissions.
        </p>
        {del.isError && (
          <p className="text-xs text-red-400 mb-3">Failed to delete.</p>
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

// ── RolesPage ─────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [formTarget, setFormTarget]   = useState<Role | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  const { data: roles = [], isLoading, isError } = useRoles()
  const { can, hasAnyRole } = usePermissions()

  const canManage = can('assign-roles') || hasAnyRole('super-admin', 'developer')

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Roles</h1>
          {roles.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{roles.length} roles</p>
          )}
        </div>
        {canManage && (
          <button
            onClick={() => setFormTarget(null)}
            className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            + New role
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Roles define what actions a user can perform. Assign roles to users from the Users page, scoped to a specific company, branch, or department — the same user can have different roles in different contexts.
      </p>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError   && <p className="text-sm text-red-400">Failed to load roles.</p>}

      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-100">{role.name}</span>
                  {role.is_locked && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-red-900/40 text-red-400">locked</span>
                  )}
                  {role.is_system && !role.is_locked && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400">system</span>
                  )}
                  {!role.is_system && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-indigo-900/40 text-indigo-400">custom</span>
                  )}
                </div>
                <PermissionMatrix selected={role.permissions ?? []} readonly />
              </div>

              {canManage && !role.is_locked && (
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setFormTarget(role)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Edit
                  </button>
                  {!role.is_system && (
                    <button
                      onClick={() => setDeleteTarget(role)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {formTarget !== undefined && (
        <RoleFormModal target={formTarget} onClose={() => setFormTarget(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal role={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
