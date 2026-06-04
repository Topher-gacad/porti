'use client'

import { useState } from 'react'
import Pagination from '@/components/dashboard/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Team, User } from '@/types/models'
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  type TeamPayload,
} from '@/hooks/useTeams'
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember } from '@/hooks/useTeamMembers'
import { useAllUsers } from '@/hooks/useUsers'

const teamSchema = z.object({
  name:        z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  is_active:   z.boolean().optional(),
})

type FormValues = z.infer<typeof teamSchema>

// ── TeamMembersModal ──────────────────────────────────────────────────────────

function TeamMembersModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const { data: members = [], isLoading } = useTeamMembers(team.id)
  const { data: allUsers = [] } = useAllUsers()
  const add    = useAddTeamMember(team.id)
  const remove = useRemoveTeamMember(team.id)
  const { can } = usePermissions()

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')

  const memberIds = new Set(members.map((m) => m.id))
  const addableUsers = allUsers.filter((u) => !memberIds.has(u.id))

  async function handleAdd() {
    if (!selectedUserId) return
    await add.mutateAsync(selectedUserId as number)
    setSelectedUserId('')
  }

  const canManage = can('manage-teams')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">{team.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}

          {members.length === 0 && !isLoading && (
            <p className="text-sm text-slate-500 italic">No members yet.</p>
          )}

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded bg-slate-700/50"
              >
                <div>
                  <p className="text-sm text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                {canManage && (
                  <button
                    onClick={() => remove.mutate(member.id)}
                    disabled={remove.isPending}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <div className="border-t border-slate-700 pt-4">
              <label className="block text-xs font-medium text-slate-400 mb-2">Add member</label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="flex-1 rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">— select user —</option>
                  {addableUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!selectedUserId || add.isPending}
                  className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {add.isPending ? '…' : 'Add'}
                </button>
              </div>
              {add.isError && (
                <p className="text-xs text-red-400 mt-2">
                  {(add.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add member.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── TeamFormModal ─────────────────────────────────────────────────────────────

function TeamFormModal({ target, onClose }: { target: Team | null; onClose: () => void }) {
  const isEdit   = target !== null
  const create   = useCreateTeam()
  const update   = useUpdateTeam()
  const isPending = create.isPending || update.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name:        target?.name        ?? '',
      description: target?.description ?? '',
      is_active:   target?.is_active   ?? true,
    },
  })

  async function onSubmit(values: FormValues) {
    const payload: TeamPayload = {
      name:        values.name,
      description: values.description || null,
      is_active:   values.is_active,
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
            {isEdit ? 'Edit Team' : 'New Team'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Infrastructure Team"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="Optional description…"
            />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
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

function ConfirmDeleteModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const del = useDeleteTeam()

  async function handleDelete() {
    await del.mutateAsync(team.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h2 className="text-base font-semibold text-slate-100 mb-2">Delete team?</h2>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{team.name}</strong> will be permanently deleted. This action cannot be undone.
        </p>
        {del.isError && (
          <p className="text-xs text-red-400 mb-3">Failed to delete. The team may have dependent records.</p>
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

// ── TeamsPage ─────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const [page, setPage]               = useState(1)
  const [formTarget, setFormTarget]   = useState<Team | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null)
  const [membersTarget, setMembersTarget] = useState<Team | null>(null)

  const { data, isLoading, isError } = useTeams(page)
  const { can } = usePermissions()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Teams</h1>
          {data && <p className="text-xs text-slate-400 mt-0.5">{data.meta.total} total</p>}
        </div>
        {can('manage-teams') && (
          <button
            onClick={() => setFormTarget(null)}
            className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            + New team
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError   && <p className="text-sm text-red-400">Failed to load teams.</p>}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  {['Name', 'Description', 'Status', 'Created', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-700">
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No teams yet.</td>
                  </tr>
                )}
                {data.data.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-200 font-medium">{team.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">
                      {team.description ?? <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        team.is_active ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {team.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(team.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setMembersTarget(team)}
                          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Members
                        </button>
                        {can('manage-teams') && (
                          <>
                            <button
                              onClick={() => setFormTarget(team)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(team)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </>
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
        <TeamFormModal target={formTarget} onClose={() => setFormTarget(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal team={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
      {membersTarget && (
        <TeamMembersModal team={membersTarget} onClose={() => setMembersTarget(null)} />
      )}
    </div>
  )
}
