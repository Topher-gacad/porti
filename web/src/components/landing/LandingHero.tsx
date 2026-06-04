import Link from 'next/link'
import Icon from '@/components/Icon'

export default function LandingHero() {
  return (
    <section
      className="pt-[72px] pb-20 relative overflow-hidden"
      style={{ flexShrink: 0, zIndex: 0 }}
    >
      <div
        className="max-w-[1280px] mx-auto w-full px-16 grid gap-12"
        style={{ gridTemplateColumns: '1.05fr .95fr' }}
      >
      {/* Left column */}
      <div className="relative z-10">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full text-xs font-semibold mb-[14px]"
          style={{ background: 'var(--green-50)', color: 'var(--green-600)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green-600)' }} />
          All systems operational
        </div>

        <h1
          className="font-bold m-0 mb-[18px]"
          style={{
            fontSize: 60,
            lineHeight: 1.02,
            letterSpacing: -1.8,
            color: 'var(--ink-900)',
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          All IT services,<br />
          <span style={{ color: 'var(--purple-700)' }}>one portal.</span>
        </h1>

        <p
          className="mb-7"
          style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-500)', maxWidth: 480 }}
        >
          COMFAC&apos;s internal IT service portal. Submit a ticket, request access, or jump
          into one of our internal apps — all from a single sign-in.
        </p>

        <div className="flex gap-2.5 mb-9">
          <Link
            href="/login"
            className="inline-flex items-center gap-[6px] font-semibold rounded-[10px] transition-opacity hover:opacity-80"
            style={{
              background: 'var(--ink-900)',
              color: '#fff',
              padding: '12px 18px',
              fontSize: 14,
            }}
          >
            Sign in to your account <Icon name="arrow-right" size={15} color="#fff" />
          </Link>
          <a
            href="#services"
            className="inline-flex items-center gap-[6px] font-medium rounded-[10px] transition-colors hover:opacity-70"
            style={{
              background: 'transparent',
              color: 'var(--ink-700)',
              padding: '12px 18px',
              fontSize: 14,
              border: '1px solid var(--ink-200)',
            }}
          >
            Browse services
          </a>
        </div>

        {/* Social proof */}
        <div className="flex gap-7 text-xs" style={{ color: 'var(--ink-500)' }}>
          <span className="flex items-center gap-[6px]">
            <Icon name="users" size={14} color="var(--ink-500)" /> 200+ COMFAC staff
          </span>
          <span className="flex items-center gap-[6px]">
            <Icon name="clock" size={14} color="var(--ink-500)" /> Avg. reply &lt; 4 hrs
          </span>
          <span className="flex items-center gap-[6px]">
            <Icon name="shield" size={14} color="var(--ink-500)" /> Backed by IT Infrastructure
          </span>
        </div>
      </div>

      {/* Right column — decorative floating cards */}
      <div className="relative" style={{ minHeight: 380 }}>
        {/* Ambient gradient */}
        <div
          className="absolute inset-0 rounded-[20px]"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, var(--purple-100) 0%, transparent 55%), radial-gradient(circle at 80% 80%, var(--purple-50) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />

        {/* Change Request card */}
        <div
          className="absolute top-[30px] right-0 w-[320px] rounded-[14px] p-4"
          style={{
            background: 'var(--card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--ink-100)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-[14px]">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}
            >
              <Icon name="refresh-cw" size={17} color="var(--blue-600)" />
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--ink-900)' }}>
                Change Request
              </div>
              <div className="text-[10px]" style={{ color: 'var(--ink-500)' }}>
                #CR-1042 · Submitted 2h ago
              </div>
            </div>
            <span
              className="ml-auto inline-flex items-center px-2 py-[3px] rounded-full text-[11px] font-semibold"
              style={{ background: 'var(--amber-50)', color: 'var(--amber-600)' }}
            >
              In review
            </span>
          </div>
          <div className="h-px mb-[14px]" style={{ background: 'var(--ink-100)' }} />
          <div className="text-[11px] mb-2" style={{ color: 'var(--ink-500)' }}>Progress</div>
          <div className="flex gap-1">
            {[true, true, false, false].map((done, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{ background: done ? 'var(--ink-900)' : 'var(--ink-100)' }}
              />
            ))}
          </div>
          <div
            className="flex justify-between mt-1.5 text-[10px]"
            style={{ color: 'var(--ink-500)' }}
          >
            <span>Submitted</span>
            <span>Reviewed</span>
            <span>Approved</span>
            <span>Done</span>
          </div>
        </div>

        {/* Resolved notification */}
        <div
          className="absolute rounded-[12px] p-3.5"
          style={{
            top: 215,
            left: 28,
            width: 234,
            background: 'var(--card)',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--ink-100)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--green-50)' }}
            >
              <Icon name="check-circle" size={15} color="var(--green-600)" />
            </div>
            <div>
              <div className="text-[11.5px] font-semibold" style={{ color: 'var(--ink-900)' }}>
                Ticket resolved
              </div>
              <div className="text-[10.5px] mt-[2px]" style={{ color: 'var(--ink-500)' }}>
                #TK-2891 · VPN access · just now
              </div>
            </div>
          </div>
        </div>

        {/* Quick action card */}
        <div
          className="absolute bottom-5 left-0 w-[280px] rounded-[14px] p-[14px]"
          style={{
            background: 'var(--card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--ink-100)',
          }}
        >
          <div className="text-[11px] mb-2.5" style={{ color: 'var(--ink-500)' }}>
            Quick action
          </div>
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
            style={{ background: 'var(--paper)' }}
          >
            <Icon name="search" size={15} color="var(--ink-500)" />
            <span className="text-xs" style={{ color: 'var(--ink-500)' }}>
              Search services or apps…
            </span>
            <span
              className="ml-auto text-[10px] px-1.5 py-[2px] rounded"
              style={{
                color: 'var(--ink-300)',
                border: '1px solid var(--ink-200)',
                fontFamily: 'monospace',
              }}
            >
              ⌘K
            </span>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
