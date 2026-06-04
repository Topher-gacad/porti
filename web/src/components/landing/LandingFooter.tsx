import PoroMark from '@/components/PoroMark'

const FOOTER_LINKS = [
  ['Portal',    ['Workshop', 'Shipped', 'Services', 'Status']],
  ['Get help',  ['Help center', 'Submit ticket', 'Contact IT', 'Knowledge base']],
  ['About',     ['IT team', 'Roadmap', 'Privacy', 'Terms']],
] as const

export default function LandingFooter() {
  return (
    <footer
      style={{
        padding: '56px 0 36px',
        background: 'var(--ink-900)',
        borderTop: '1px solid rgba(255,255,255,.07)',
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-16">
        <div className="grid gap-10 mb-10" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PoroMark size={22} color="rgba(255,255,255,.9)" />
              <span
                className="font-extrabold text-[17px] tracking-tight"
                style={{ color: '#fff', letterSpacing: -0.6 }}
              >
                Porti<span style={{ color: 'var(--purple-500)' }}>.</span>
              </span>
            </div>
            <p
              className="m-0 text-[13px]"
              style={{ color: 'rgba(255,255,255,.4)', lineHeight: 1.65, maxWidth: 280 }}
            >
              The internal IT service portal for COMFAC. Built and maintained by the IT team.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(([heading, items]) => (
            <div key={heading}>
              <div
                className="text-[11px] font-bold tracking-[1px] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,.3)' }}
              >
                {heading}
              </div>
              {items.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-[13px] mb-2.5 no-underline transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,.55)' }}
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between items-center pt-6 text-[11.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.25)' }}
        >
          <span>© 2026 COMFAC IT · Built with care in Manila</span>
          <span>v2.4.0 · last deployed 2 days ago</span>
        </div>
      </div>
    </footer>
  )
}
