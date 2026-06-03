'use client'

import { useState } from 'react'
import Pagination from '@/components/dashboard/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Department } from '@/types/models'
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type DepartmentPayload,
} from '@/hooks/useDepartments'
import { useAllBranches } from '@/hooks/useBranches'

const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  branch_id: z.string().optional(),
  is_active: z.boolean().optional(),
})

type FormValues = z.infer<typeof departmentSchema>

function DepartmentFormModal({
  target,
  onClose,
}: {
  target: Department | null
  onClose: () => void
}) {
  const isEdit = target !== null
  const create = useCreateDepartment()
  const update = useUpdateDepartment()
  const isPending = create.isPending || update.isPending
  const { data: branchData } = useAllBranches()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: target?.name ?? '',
      code: target?.code ?? '',
      branch_id: target?.branch_id ? String(target.branch_id) : '',
      is_active: target?.is_active ?? true,
    },
  })

  async function onSubmit(values: FormValues) {
    const payload: DepartmentPayload = {
      name: values.name,
      code: values.code,
      branch_id: values.branch_id ? Number(values.branch_id) : null,
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
            {isEdit ? 'Edit Department' : 'New Department'}
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
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="IT Department"
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Code <span className="text-red-400">*</span>
            </label>
            <input
              {...register('code')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="IT"
            />
            {errors.code && (
              <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Branch
            </label>
            <select
              {...register('branch_id')}
              className="w-full rounded bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">— None —</option>
              {branchData?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm text-slate-300">
                Active
              </label>
            </div>
          )}

          {(create.isError || update.isError) && (
            <p className="text-xs text-red-400">
              Failed to save. Please check the values and try again.
            </p>
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
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({
  department,
  onClose,
}: {
  department: Department
  onClose: () => void
}) {
  const del = useDeleteDepartment()

  async function handleDelete() {
    await del.mutateAsync(department.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h2 className="text-base font-semibold text-slate-100 mb-2">Delete department?</h2>
        <p className="text-sm text-slate-400 mb-5">
          <strong className="text-slate-200">{department.name}</strong> will be permanently
          deleted. This action cannot be undone.
        </p>
        {del.isError && (
          <p className="text-xs text-red-400 mb-3">
            Failed to delete. The department may have dependent records.
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

export default function DepartmentsPage() {
  const [page, setPage] = useState(1)
  const [formTarget, setFormTarget] = useState<Department | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)

  const { data, isLoading, isError } = useDepartments(page)
  const { can } = usePermissions()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Departments</h1>
          {data && (
            <p className="text-xs text-slate-400 mt-0.5">{data.meta.total} total</p>
          )}
        </div>
        {can('manage-departments') && (
          <button
            onClick={() => setFormTarget(null)}
            className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            + New department
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
      {isError && <p className="text-sm text-red-400">Failed to load departments.</p>}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  {['Name', 'Code', 'Branch', 'Status', 'Created', ''].map((h) => (
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
                      No departments yet.
                    </td>
                  </tr>
                )}
                {data.data.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-200 font-medium">
                      {dept.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {dept.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {dept.branch_id ?? <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          dept.is_active
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(dept.created_at).toLocaleDateString()}
                    </td>
                    {can('manage-departments') && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setFormTarget(dept)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(dept)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
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
        <DepartmentFormModal target={formTarget} onClose={() => setFormTarget(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal department={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
