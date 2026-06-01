import Link from 'next/link'
import Icon from '@/components/Icon'

export default function CTASection() {
  return (
    <section
      style={{
        padding: '32px 0',
        background: 'var(--paper)',
        borderTop: '1px solid var(--ink-100)',
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-16">
        <div className="flex items-center justify-between gap-8">
          <div>
            <span
              className="font-bold"
              style={{ fontSize: 15.5, color: 'var(--ink-900)', letterSpacing: -0.2 }}
            >
              Ready to get started?
            </span>
            <span className="ml-2" style={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
              No account yet?{' '}
              <a
                href="mailto:it@comfac-it.com"
                style={{ color: 'var(--purple-700)', fontWeight: 600 }}
              >
                Contact IT to get set up.
              </a>
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold rounded-[10px] transition-opacity hover:opacity-80 shrink-0"
            style={{
              background: 'var(--purple-700)',
              color: '#fff',
              padding: '11px 20px',
              fontSize: 13.5,
            }}
          >
            Sign in to Porti <Icon name="arrow-right" size={14} color="#fff" />
          </Link>
        </div>
      </div>
    </section>
  )
}
