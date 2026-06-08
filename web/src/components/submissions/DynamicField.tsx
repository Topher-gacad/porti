'use client'

import type { FormField } from '@/types/models'

export type RefOption = { id: number; name: string }

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--paper)', border: '1px solid var(--ink-200)',
  borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 5,
}

type Props = {
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  users?: RefOption[]
  teams?: RefOption[]
}

/**
 * Renders one form field from the closed field-type registry. Controlled — the parent owns
 * the data object and passes value/onChange. Server-side validation is the source of truth;
 * `error` surfaces a per-field message from a 422 response.
 */
export default function DynamicField({ field, value, onChange, error, users = [], teams = [] }: Props) {
  const label = field.label ?? field.key
  const num = (raw: string) => (raw === '' ? undefined : Number(raw))

  function control() {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        )

      case 'number':
      case 'currency':
        return (
          <input type="number" step="any" min={field.min} max={field.max}
            value={(value as number | undefined) ?? ''}
            onChange={(e) => onChange(num(e.target.value))} style={inputStyle} />
        )

      case 'integer':
      case 'duration':
        return (
          <input type="number" step="1" min={field.min} max={field.max}
            value={(value as number | undefined) ?? ''}
            onChange={(e) => onChange(num(e.target.value))} style={inputStyle} />
        )

      case 'date':
        return (
          <input type="date" value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )

      case 'datetime':
        return (
          <input type="datetime-local" value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )

      case 'boolean':
        return (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-700)' }}>
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            Yes
          </label>
        )

      case 'select':
      case 'radio':
        return (
          <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || undefined)} style={inputStyle}>
            <option value="">— select —</option>
            {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )

      case 'multiselect': {
        const selected = Array.isArray(value) ? (value as string[]) : []
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {(field.options ?? []).map((o) => (
              <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-700)' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={(e) => onChange(e.target.checked ? [...selected, o] : selected.filter((x) => x !== o))}
                />
                {o}
              </label>
            ))}
          </div>
        )
      }

      case 'user':
      case 'team': {
        const opts = field.type === 'user' ? users : teams
        return (
          <select
            value={(value as number | undefined) ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            style={inputStyle}
          >
            <option value="">— select —</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )
      }

      case 'file':
        return (
          <input type="text" value={(value as string) ?? ''} placeholder="URL or reference"
            onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )

      default:
        return (
          <input type="text" value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )
    }
  }

  return (
    <div>
      <label style={labelStyle}>
        {label}{field.required && <span style={{ color: 'var(--rose-600)' }}> *</span>}
      </label>
      {control()}
      {error && <p style={{ fontSize: 11.5, color: 'var(--rose-600)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}
