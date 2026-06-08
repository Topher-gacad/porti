// Status colour keys off the fixed category spine ("categories are truth"), not the
// free-form state name. CSS-var fallbacks keep it robust if a *-50 token isn't defined.
const CATEGORY_COLORS: Record<string, [string, string]> = {
  open: ['var(--purple-50)', 'var(--purple-700)'],
  in_progress: ['var(--amber-50, #fef3c7)', 'var(--amber-600)'],
  resolved: ['var(--green-50, #dcfce7)', 'var(--green-600)'],
  closed: ['var(--ink-100)', 'var(--ink-500)'],
  cancelled: ['var(--rose-50, #ffe4e6)', 'var(--rose-600)'],
}

export default function StateBadge({ state, category }: { state: string | null; category: string | null }) {
  const [bg, fg] = CATEGORY_COLORS[category ?? ''] ?? ['var(--ink-100)', 'var(--ink-700)']
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: bg, color: fg, whiteSpace: 'nowrap' }}>
      {state ?? '—'}
    </span>
  )
}
