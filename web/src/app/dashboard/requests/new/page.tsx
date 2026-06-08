'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import DynamicField from '@/components/submissions/DynamicField'
import { useForms, useForm } from '@/hooks/useForms'
import { useCreateSubmission } from '@/hooks/useSubmissions'
import { useAllUsers } from '@/hooks/useUsers'
import { useAllTeams } from '@/hooks/useTeams'

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }

const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12 }

export default function NewRequestPage() {
  const router = useRouter()
  const { data: forms, isLoading: formsLoading } = useForms()
  const [formKey, setFormKey] = useState('')
  const { data: form, isLoading: schemaLoading } = useForm(formKey || null)

  const { data: users } = useAllUsers()
  const { data: teams } = useAllTeams()
  const userOpts = useMemo(() => (users ?? []).map((u) => ({ id: u.id, name: u.name })), [users])
  const teamOpts = useMemo(() => (teams ?? []).map((t) => ({ id: t.id, name: t.name })), [teams])

  const [data, setData] = useState<Record<string, unknown>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const create = useCreateSubmission()

  function pickForm(key: string) {
    setFormKey(key)
    setData({})
    setFieldErrors({})
    setFormError(null)
  }

  async function submit() {
    if (!formKey) return
    setFieldErrors({})
    setFormError(null)
    try {
      const res = await create.mutateAsync({ form_key: formKey, data })
      router.push(`/dashboard/requests/${res.data.data.id}`)
    } catch (err) {
      const e = err as ApiError
      const errors = e.response?.data?.errors
      if (errors) {
        const mapped: Record<string, string> = {}
        for (const [k, msgs] of Object.entries(errors)) mapped[k] = msgs[0]
        setFieldErrors(mapped)
      } else {
        setFormError(e.response?.data?.message ?? 'Could not submit the request. Please review the form.')
      }
    }
  }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <Link href="/dashboard/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-500)', textDecoration: 'none', marginBottom: 8 }}>
          <Icon name="arrow-left" size={13} color="var(--ink-500)" /> Requests
        </Link>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>New request</div>
      </div>

      <div style={{ ...card, padding: 20, maxWidth: 560 }}>
        {/* Form picker */}
        <div style={{ marginBottom: form ? 20 : 0 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 5 }}>
            Request type <span style={{ color: 'var(--rose-600)' }}>*</span>
          </label>
          <select
            value={formKey}
            onChange={(e) => pickForm(e.target.value)}
            disabled={formsLoading}
            style={{ width: '100%', background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit' }}
          >
            <option value="">{formsLoading ? 'Loading…' : '— select a request type —'}</option>
            {(forms ?? []).map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
          </select>
        </div>

        {schemaLoading && formKey && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading form…</div>}

        {form && (
          <form onSubmit={(e) => { e.preventDefault(); submit() }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {form.field_schema.map((field) => (
              <DynamicField
                key={field.key}
                field={field}
                value={data[field.key]}
                onChange={(v) => setData((d) => ({ ...d, [field.key]: v }))}
                error={fieldErrors[field.key]}
                users={userOpts}
                teams={teamOpts}
              />
            ))}

            {formError && <p style={{ fontSize: 12, color: 'var(--rose-600)' }}>{formError}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
              <Link href="/dashboard/requests" style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--ink-500)', textDecoration: 'none' }}>Cancel</Link>
              <button
                type="submit"
                disabled={create.isPending}
                style={{ background: 'var(--ink-900)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, cursor: create.isPending ? 'wait' : 'pointer', opacity: create.isPending ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {create.isPending ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
