import Link from 'next/link'
import PoroMark from '@/components/PoroMark'

const NAV = ['Workshop', 'Shipped', 'Services', 'Status', 'Help']

export default function LandingHeader() {
  return (
    <header
      className="sticky top-0 z-50 h-16"
      style={{
        background: 'rgba(251,250,253,.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ink-100)',
        boxShadow: '0 1px 3px rgba(39,32,48,.06)',
        flexShrink: 0,
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-16 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <PoroMark size={22} />
            <span
              className="font-extrabold text-[17px] tracking-tight"
              style={{ color: 'var(--ink-900)', letterSpacing: -0.6 }}
            >
              Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
            </span>
          </Link>
          <nav className="flex gap-[22px] text-[13px]" style={{ color: 'var(--ink-700)' }}>
            {NAV.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-medium no-underline transition-opacity hover:opacity-70"
                style={{ color: 'var(--ink-700)' }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-[9px] rounded-[10px] transition-opacity hover:opacity-80"
          style={{ background: 'var(--ink-900)', color: '#fff' }}
        >
          Sign in <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  )
}
