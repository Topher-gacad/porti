'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Icon from '@/components/Icon'
import StateBadge from '@/components/submissions/StateBadge'
import { useSubmission, useApplyTransition } from '@/hooks/useSubmissions'

type ApiError = { response?: { data?: { message?: string } } }

const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12 }

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

function eventLabel(verb: string, props: Record<string, unknown>): string {
  if (verb === 'workflow.started') return 'Created'
  if (verb === 'workflow.transitioned') {
    const to = props.to ? ` → ${String(props.to)}` : ''
    return `${String(props.transition ?? 'Transitioned')}${to}`
  }
  return verb
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: sub, isLoading, isError } = useSubmission(id)
  const apply = useApplyTransition()
  const [comment, setComment] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  async function act(slug: string) {
    setActionError(null)
    try {
      await apply.mutateAsync({ id, slug, comment: comment.trim() || undefined })
      setComment('')
    } catch (err) {
      setActionError((err as ApiError).response?.data?.message ?? 'Action failed.')
    }
  }

  return (
    <>
      <Link href="/dashboard/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-500)', textDecoration: 'none', marginBottom: 12 }}>
        <Icon name="arrow-left" size={13} color="var(--ink-500)" /> Requests
      </Link>

      {isLoading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Loading…</div>}
      {isError && <div style={{ fontSize: 13, color: 'var(--rose-600)' }}>Request not found.</div>}

      {sub && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>
                {sub.form_name ?? sub.form_key}
              </div>
              <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>{sub.number}</div>
            </div>
            <span style={{ marginLeft: 'auto' }}><StateBadge state={sub.state} category={sub.state_category} /></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, alignItems: 'start' }}>
            {/* Details */}
            <div style={{ ...card, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12 }}>Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(sub.data).map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, fontSize: 13 }}>
                    <span style={{ color: 'var(--ink-500)' }}>{humanize(k)}</span>
                    <span style={{ color: 'var(--ink-900)' }}>{fmt(v)}</span>
                  </div>
                ))}
                {Object.keys(sub.data).length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>No fields.</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--ink-100)', marginTop: 16, paddingTop: 14, display: 'flex', gap: 24, fontSize: 12.5 }}>
                <div>
                  <div style={{ color: 'var(--ink-500)', marginBottom: 2 }}>Requested by</div>
                  <div style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{sub.requester?.name ?? '—'}</div>
                </div>
                {sub.assignee && (
                  <div>
                    <div style={{ color: 'var(--ink-500)', marginBottom: 2 }}>Assignee</div>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{sub.assignee.name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions + timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sub.available_transitions.length > 0 && (
                <div style={{ ...card, padding: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>Actions</div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (required by some actions)…"
                    rows={2}
                    style={{ width: '100%', background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, color: 'var(--ink-900)', fontFamily: 'inherit', resize: 'vertical', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {sub.available_transitions.map((t) => (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => act(t.slug)}
                        disabled={apply.isPending}
                        style={{ background: 'var(--purple-700)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: apply.isPending ? 'wait' : 'pointer', opacity: apply.isPending ? 0.6 : 1, fontFamily: 'inherit' }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  {actionError && <p style={{ fontSize: 11.5, color: 'var(--rose-600)', marginTop: 8 }}>{actionError}</p>}
                </div>
              )}

              <div style={{ ...card, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sub.timeline.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>No activity yet.</span>}
                  {sub.timeline.map((e, i) => {
                    const props = (e.properties ?? {}) as Record<string, unknown>
                    return (
                      <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--purple-700)', marginTop: 5, flex: '0 0 auto' }} />
                        <div>
                          <div style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{eventLabel(e.verb, props)}</div>
                          <div style={{ color: 'var(--ink-500)' }}>
                            {e.actor?.name ?? 'System'}
                            {e.created_at && ` · ${new Date(e.created_at).toLocaleString()}`}
                          </div>
                          {typeof props.comment === 'string' && props.comment && (
                            <div style={{ color: 'var(--ink-700)', marginTop: 2, fontStyle: 'italic' }}>“{props.comment}”</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
