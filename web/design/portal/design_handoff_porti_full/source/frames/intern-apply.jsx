// Internship Application — public-facing entry point for prospective interns
// Two-column: hero card with scope/expectations on the left, email-verify card on the right
// Themed to match Porti: matte paper, ink, lavender accent, faceless Poro hero mark

const InternApplyFrame = ({ width = 1280, height = 920 }) => {
  const PoroMark = window.PoroMark;
  return (
    <BrowserChrome url="porti.comfac-it.com/apply" height={height}>
      <div className="frame" style={{ width: '100%', height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
        {/* Soft brand glows */}
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <header style={{ position: 'relative', height: 60, padding: '0 32px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PoroMark size={22} color="var(--purple-700)" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.6, color: 'var(--ink-900)' }}>
              Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a style={{ fontSize: 12.5, color: 'var(--ink-700)', fontWeight: 500, cursor: 'pointer' }}>Track application</a>
            <button style={{ background: 'var(--ink-900)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Login <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div style={{ position: 'relative', padding: '40px 64px 56px', maxWidth: 1180, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg, var(--ink-900) 0%, #2f2840 100%)',
            borderRadius: 20, padding: '40px 44px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 30px 60px -30px rgba(39,32,48,.4)',
          }}>
            {/* Decorative dot grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            {/* Floating poro */}
            <div style={{ position: 'absolute', top: 28, right: 44, opacity: .15 }}>
              <PoroMark size={140} color="#fff" />
            </div>

            <div style={{ position: 'relative', maxWidth: 640 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                color: '#d8c8ff', marginBottom: 18,
              }}>
                <Icon name="sparkle" size={12} /> Now accepting Summer 2026 applications
              </div>
              <div style={{ fontSize: 38, lineHeight: 1.12, letterSpacing: -1.2, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                COMFAC IT Internship<br/>
                <span style={{ color: 'var(--purple-500)' }}>Apply in 3 minutes.</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', maxWidth: 520, marginBottom: 22 }}>
                Work alongside our IT team on real infrastructure, internal apps, and DevOps projects. Hands-on, mentored, and counted toward your required hours.
              </div>

              {/* Inline expectations strip */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  ['map-pin', 'On-site · COMFAC HQ'],
                  ['calendar', '3-month minimum'],
                  ['clock', 'Mon–Fri · flexible hours'],
                ].map(([icon, label]) => (
                  <div key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                    padding: '6px 12px', borderRadius: 999,
                    fontSize: 11.5, color: 'rgba(255,255,255,.85)', fontWeight: 500,
                  }}>
                    <Icon name={icon} size={12} color="var(--purple-500)" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 24, marginTop: 28 }}>
            {/* Left — Scope */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: 'var(--ink-900)' }}>What you'll work on</div>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>5 focus areas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { n: 1, t: 'Office Management & Productivity Tools', d: 'Set up and maintain Nextcloud, ERPNext modules, and team workflows.', open: true },
                  { n: 2, t: 'Linux Debian / Ubuntu Workflow', d: 'Daily ops on our Debian servers — packages, cron, systemd, shell tooling.', open: false },
                  { n: 3, t: 'Infrastructure & Networking', d: 'VLANs, firewalls, monitoring stack, and on-prem service deployment.', open: false },
                  { n: 4, t: 'Software Development & AI Mastery', d: 'Internal tools in Python/JS, plus practical work with LLM integrations.', open: false },
                  { n: 5, t: 'Integration Management & Advanced Methodologies', d: 'Webhooks, API glue, CI/CD, and the standards we use across services.', open: false },
                ].map(s => (
                  <div key={s.n} style={{
                    background: 'var(--card)', border: '1px solid var(--ink-100)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: s.open ? '0 1px 0 var(--purple-100), 0 6px 16px -10px rgba(91,77,200,.25)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 8, flex: '0 0 auto',
                        background: s.open ? 'var(--purple-700)' : 'var(--purple-50)',
                        color: s.open ? '#fff' : 'var(--purple-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{s.n}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{s.t}</span>
                      <Icon name={s.open ? 'chevron-up' : 'chevron-down'} size={14} color="var(--ink-500)" />
                    </div>
                    {s.open && (
                      <div style={{ padding: '0 16px 14px 54px', fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-700)' }}>
                        {s.d}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--amber-50)', border: '1px solid #fde4b3', borderRadius: 12, padding: '12px 14px' }}>
                  <Icon name="info" size={14} color="var(--amber-600)" style={{ marginTop: 1, flex: '0 0 auto' }} />
                  <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--ink-900)' }}>
                    Allowances and stipends are <b>subject to budget availability</b> and discussed during the interview.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: '12px 14px' }}>
                  <Icon name="check-circle" size={14} color="var(--green-600)" style={{ marginTop: 1, flex: '0 0 auto' }} />
                  <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--ink-700)' }}>
                    DTR, mentorship, and hours-completion certificate are provided at the end of your internship.
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Email verify */}
            <div style={{ position: 'sticky', top: 24 }}>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--ink-100)',
                borderRadius: 16, padding: 28,
                boxShadow: '0 20px 40px -20px rgba(39,32,48,.18)',
              }}>
                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                  <div style={{ width: 28, height: 6, borderRadius: 99, background: 'var(--purple-700)' }} />
                  <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--ink-100)' }} />
                  <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--ink-100)' }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, marginLeft: 4 }}>1 / 3</span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink-900)', marginBottom: 4 }}>Ready to apply?</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 18, lineHeight: 1.55 }}>
                  We'll send a 6-digit code to your email so we know it's really you before opening the form.
                </div>

                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>Email address</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--paper)', border: '1.5px solid var(--purple-600)',
                  borderRadius: 10, padding: '11px 13px',
                  boxShadow: '0 0 0 3px var(--purple-100)',
                }}>
                  <Icon name="mail" size={14} color="var(--purple-700)" />
                  <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit' }} defaultValue="juan@example.com" />
                </div>

                <button style={{
                  width: '100%', marginTop: 14,
                  background: 'var(--purple-700)', color: '#fff',
                  border: 'none', padding: '12px 16px', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)',
                }}>
                  <Icon name="send" size={13} /> Send verification code
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 14px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
                  <div style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.5 }}>OR</div>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--ink-100)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>Already applied?</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>Track your application status</div>
                  </div>
                  <Icon name="arrow-right" size={14} color="var(--purple-700)" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 10.5, color: 'var(--ink-500)', justifyContent: 'center' }}>
                  <Icon name="lock" size={11} /> Your email is only used for verification — never shared.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
};

window.InternApplyFrame = InternApplyFrame;
