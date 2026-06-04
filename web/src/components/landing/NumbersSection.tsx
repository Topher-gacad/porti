import Reveal from './Reveal'

const STATS = [
  { value: '2,143',  label: 'Tickets resolved',  sub: '94% within SLA' },
  { value: '99.94%', label: 'Uptime · last 90d',  sub: 'No major incidents' },
  { value: '13',     label: 'Apps integrated',    sub: 'Single sign-on' },
  { value: '38',     label: 'Projects shipped',   sub: '+6 vs. last year' },
]

export default function NumbersSection() {
  return (
    <section
      style={{
        padding: '80px 0',
        background: 'var(--card)',
        borderTop: '1px solid var(--ink-100)',
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-16">
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: '1fr 1.15fr', gap: 80 }}
        >
          {/* Left — heading */}
          <Reveal>
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-3"
              style={{ color: 'var(--purple-700)' }}
            >
              By the numbers
            </div>
            <h2
              className="font-extrabold m-0 mb-4"
              style={{
                fontSize: 38,
                lineHeight: 1.1,
                letterSpacing: -1.2,
                color: 'var(--ink-900)',
              }}
            >
              IT, by the<br />year so far.
            </h2>
            <p
              className="m-0"
              style={{ fontSize: 15, color: 'var(--ink-500)', lineHeight: 1.65, maxWidth: 340 }}
            >
              Measured, transparent, and accountable — a live snapshot of how the team has performed.
            </p>
          </Reveal>

          {/* Right — 2×2 stat grid */}
          <div
            className="grid"
            style={{ gridTemplateColumns: '1fr 1fr', rowGap: 40, columnGap: 48 }}
          >
            {STATS.map(({ value, label, sub }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div
                  style={{
                    paddingTop: 20,
                    borderTop: '2px solid var(--purple-100)',
                  }}
                >
                  <div
                    className="font-extrabold leading-none"
                    style={{ fontSize: 46, letterSpacing: -1.5, color: 'var(--purple-700)' }}
                  >
                    {value}
                  </div>
                  <div
                    className="font-semibold mt-2"
                    style={{ fontSize: 13.5, color: 'var(--ink-900)' }}
                  >
                    {label}
                  </div>
                  <div
                    className="mt-[3px]"
                    style={{ fontSize: 11.5, color: 'var(--ink-500)' }}
                  >
                    {sub}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
