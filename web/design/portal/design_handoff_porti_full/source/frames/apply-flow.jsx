// Internship Application — full applicant flow
// Steps: 1 Email (in intern-apply.jsx) · 2 Verify · 3 Details · 4 Resume · 5 Cover · 6 Success
// Plus: Track application page with withdraw flow

const ApplyShell = ({ step, total = 5, height = 920, url, children }) => (
  <BrowserChrome url={`porti.comfac-it.com/apply${url || ''}`} height={height}>
    <div className="frame" style={{ width: '100%', height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <ApplyHeader />

      <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto', padding: '32px 32px 56px' }}>
        <ProgressRail step={step} total={total} />
        <div style={{
          marginTop: 20, background: 'var(--card)', border: '1px solid var(--ink-100)',
          borderRadius: 18, padding: '32px 36px',
          boxShadow: '0 20px 50px -25px rgba(39,32,48,.18)',
        }}>
          {children}
        </div>
      </div>
    </div>
  </BrowserChrome>
);

const ApplyHeader = () => {
  const PoroMark = window.PoroMark;
  return (
    <header style={{ position: 'relative', height: 60, padding: '0 32px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <PoroMark size={22} color="var(--purple-700)" />
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.6, color: 'var(--ink-900)' }}>
          Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-500)', marginLeft: 10, padding: '3px 9px', background: 'var(--paper)', borderRadius: 99, fontWeight: 600 }}>Internship Application</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a style={{ fontSize: 12.5, color: 'var(--ink-500)', cursor: 'pointer' }}>Save & exit</a>
        <a style={{ fontSize: 12.5, color: 'var(--ink-700)', fontWeight: 500, cursor: 'pointer' }}>Need help?</a>
      </div>
    </header>
  );
};

const ProgressRail = ({ step, total }) => {
  const labels = ['Email', 'Verify', 'About you', 'Resume', 'Cover letter'];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      {labels.slice(0, total).map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99,
                background: done ? 'var(--purple-700)' : active ? 'var(--card)' : 'var(--paper)',
                border: '1.5px solid', borderColor: done ? 'var(--purple-700)' : active ? 'var(--purple-700)' : 'var(--ink-200)',
                color: done ? '#fff' : active ? 'var(--purple-700)' : 'var(--ink-500)',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{done ? <Icon name="check" size={11} /> : i + 1}</div>
              <span style={{ fontSize: 12, fontWeight: active || done ? 600 : 500, color: active ? 'var(--ink-900)' : done ? 'var(--ink-700)' : 'var(--ink-500)' }}>{label}</span>
            </div>
            {i < total - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--purple-700)' : 'var(--ink-100)', borderRadius: 99 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Step 2: Verify code ──────────────────────────
const ApplyVerifyFrame = () => {
  const segs = ['8', '4', '2', '', '', ''];
  return (
    <ApplyShell step={1} url="/verify">
      <StepHeading title="Check your email" sub={<>We sent a 6-digit code to <b style={{ color: 'var(--ink-900)' }}>juan@example.com</b>. Enter it below to continue.</>} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 22 }}>
        {segs.map((c, i) => (
          <div key={i} style={{
            width: 52, height: 60, borderRadius: 12,
            background: 'var(--paper)',
            border: '1.5px solid', borderColor: i === 3 ? 'var(--purple-600)' : 'var(--ink-200)',
            boxShadow: i === 3 ? '0 0 0 3px var(--purple-100)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'var(--ink-900)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{c}</div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--ink-500)' }}>
        Didn't receive it? <span style={{ color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Resend code</span> · expires in <span className="mono" style={{ color: 'var(--ink-700)' }}>04:32</span>
      </div>
      <NavRow back="Use another email" primary="Verify & continue" disabled={false} />
    </ApplyShell>
  );
};

// ─── Step 3: Personal + School + Internship requirement ───
const ApplyDetailsFrame = () => (
  <ApplyShell step={2} url="/details">
    <StepHeading title="Tell us about yourself" sub="We'll match this with your school's internship requirements." />

    <Section title="Personal" />
    <Row cols={2}>
      <Field label="First name" required value="Juan" />
      <Field label="Last name" required value="Dela Cruz" />
    </Row>
    <Row cols={2}>
      <Field label="Mobile number" icon="phone" required value="+63 917 555 0142" />
      <Field label="Date of birth" icon="calendar" required value="Mar 14, 2003" />
    </Row>
    <Field label="Home address" icon="map-pin" required value="12 Katipunan Ave, Quezon City" />

    <Section title="Academic" topGap={20} />
    <Field label="School / University" icon="book" required value="University of the Philippines — Diliman" valid />
    <Row cols={2}>
      <Field label="Course" required value="BS Computer Science" />
      <Field label="Year level" required value="4th year" />
    </Row>

    <Section title="Internship requirement" topGap={20} />
    <Row cols={2}>
      <Field label="Required hours" icon="clock" required value="486" suffix="hrs" />
      <Field label="Required end date" icon="calendar" required value="Aug 12, 2026" />
    </Row>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--purple-50)', border: '1px solid var(--purple-100)', borderRadius: 10, marginTop: 12 }}>
      <Icon name="info" size={14} color="var(--purple-700)" />
      <span style={{ fontSize: 12, color: 'var(--ink-900)', lineHeight: 1.5 }}>
        Based on <b>486 hrs</b> at 8 hrs/day × 5 days/week, your internship would run roughly <b>May 12 – Aug 12, 2026</b> (≈ 12 weeks).
      </span>
    </div>

    <NavRow back="Back" primary="Continue" />
  </ApplyShell>
);

// ─── Step 4: Resume upload (PDF, size limit) ───────
const ApplyResumeFrame = ({ state = 'uploaded' }) => (
  <ApplyShell step={3} url="/resume">
    <StepHeading title="Upload your resume / CV" sub="PDF only, up to 5 MB. Make sure your contact info is on the first page." />

    {state === 'empty' && (
      <div style={{
        marginTop: 18, border: '2px dashed var(--ink-200)', borderRadius: 14,
        padding: '44px 32px', background: 'var(--paper)', textAlign: 'center', cursor: 'pointer',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Icon name="upload" size={26} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>
          Drop your PDF here or <span style={{ color: 'var(--purple-700)' }}>browse files</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>PDF · max 5 MB</div>
      </div>
    )}

    {state === 'uploaded' && (
      <div style={{ marginTop: 18, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 64, borderRadius: 8, flex: '0 0 auto',
            background: 'linear-gradient(135deg, var(--rose-50) 0%, var(--rose-50) 100%)',
            border: '1px solid #f3c4cc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--rose-600)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            position: 'relative',
          }}>
            PDF
            <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 99, background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--card)' }}>
              <Icon name="check" size={9} color="#fff" />
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>JuanDelaCruz_Resume_2026.pdf</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>2.4 MB · uploaded just now · 4 pages</div>
            <div style={{ marginTop: 8, height: 4, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--green-600)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flex: '0 0 auto' }}>
            <button style={iconBtn}><Icon name="eye" size={14} color="var(--ink-700)" /></button>
            <button style={iconBtn}><Icon name="trash" size={14} color="var(--rose-600)" /></button>
          </div>
        </div>
      </div>
    )}

    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 10 }}>
      <Icon name="lightbulb" size={14} color="var(--amber-600)" style={{ flex: '0 0 auto', marginTop: 1 }} />
      <div style={{ fontSize: 12, color: 'var(--ink-700)', lineHeight: 1.55 }}>
        Tip: include a brief summary, your skills (especially Linux / Python / networking), and any past projects or internships. We don't need a long CV — 1–2 pages is perfect.
      </div>
    </div>

    <NavRow back="Back" primary="Continue" />
  </ApplyShell>
);

// ─── Step 5: Cover letter ──────────────────────────
const ApplyCoverFrame = () => (
  <ApplyShell step={4} url="/cover">
    <StepHeading title="Why are you applying?" sub="Tell us why you want to intern at COMFAC IT in your own words. 2–3 paragraphs is plenty." />

    <div style={{ marginTop: 18, background: 'var(--paper)', border: '1.5px solid var(--purple-600)', borderRadius: 12, boxShadow: '0 0 0 3px var(--purple-100)' }}>
      <div style={{ padding: '14px 16px', minHeight: 220, fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-900)', fontFamily: 'inherit' }}>
        I'm applying to COMFAC IT because I want hands-on experience with real Linux infrastructure — not just classroom labs. I've been running Debian on my own server for two years, and I'd love to learn how a small but serious IT team manages production systems day-to-day.<br/><br/>
        I'm especially interested in the Infrastructure & Networking track. Last semester I built a small monitoring stack with Prometheus and Grafana for a class project, and I'd like to see how that scales when it's running services people actually depend on.<span style={{ background: 'var(--purple-100)', color: 'var(--purple-800)' }}>|</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid var(--ink-100)', background: 'var(--card)', borderRadius: '0 0 12px 12px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['bold', 'italic', 'list', 'link'].map(n => (
            <button key={n} style={{ ...iconBtn, padding: 6 }}><Icon name={n} size={12} color="var(--ink-500)" /></button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
          <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>184</span> / 1500 words · saves automatically
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
      {[
        ['What track interests you most, and why?'],
        ['What have you built outside of class?'],
        ['What do you hope to learn here?'],
      ].map(([q]) => (
        <div key={q} style={{ background: 'var(--paper)', border: '1px dashed var(--ink-200)', borderRadius: 10, padding: '10px 12px', fontSize: 11.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>
          <Icon name="message-circle" size={11} color="var(--purple-700)" /> {q}
        </div>
      ))}
    </div>

    <NavRow back="Back" primary="Submit application" primaryIcon="check" />
  </ApplyShell>
);

// ─── Step 6: Submitted ─────────────────────────────
const ApplySuccessFrame = () => {
  const PoroMark = window.PoroMark;
  return (
    <BrowserChrome url="porti.comfac-it.com/apply/done" height={920}>
      <div className="frame" style={{ width: '100%', height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <ApplyHeader />
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PoroMark size={56} color="var(--purple-700)" />
            </div>
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderRadius: 99, background: 'var(--green-600)', border: '3px solid var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={16} color="#fff" />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, color: 'var(--ink-900)', marginBottom: 10 }}>Application submitted!</div>
          <div style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: 24 }}>
            Thanks, Juan. We've sent a confirmation to <b style={{ color: 'var(--ink-900)' }}>juan@example.com</b> with your tracking link. The IT team usually responds within <b style={{ color: 'var(--ink-900)' }}>3–5 working days</b>.
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name="hash" size={20} />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Your application ID</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: 1 }}>APP-2026-0142</div>
            </div>
            <button style={{ ...iconBtn, padding: '8px 12px', fontSize: 11.5, fontWeight: 600, color: 'var(--purple-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="copy" size={12} /> Copy
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={{ ...primaryBtn, padding: '12px 22px', fontSize: 13.5 }}>
              Track application <Icon name="arrow-right" size={14} />
            </button>
            <button style={{ ...ghostBtn, padding: '12px 18px', fontSize: 13.5 }}>Back to home</button>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
};

// ─── Track application ────────────────────────────
const TrackApplicationFrame = ({ status = 'review' }) => (
  <BrowserChrome url={`porti.comfac-it.com/apply/track/APP-2026-0142`} height={960}>
    <div className="frame" style={{ width: '100%', height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <ApplyHeader />
      <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto', padding: '32px 32px 56px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Application</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: 0.5 }}>APP-2026-0142</div>
              <Pill tone="amber"><Icon name="clock" size={11} /> In review</Pill>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 6 }}>
              Submitted Mar 18, 2026 · last updated 2 days ago
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button style={{ ...ghostBtn, padding: '9px 14px', fontSize: 12.5 }}>
              <Icon name="download" size={13} /> Download submission
            </button>
            <button style={{
              background: 'var(--card)', border: '1px solid var(--rose-50)', color: 'var(--rose-600)',
              padding: '9px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="x" size={13} /> Withdraw
            </button>
          </div>
        </div>

        {/* Status timeline */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 16, padding: 24, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 18, letterSpacing: -0.2 }}>Application status</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {[
              { key: 'submit', label: 'Submitted', sub: 'Mar 18', icon: 'check', state: 'done' },
              { key: 'review', label: 'In review', sub: 'IT Manager', icon: 'eye', state: 'active' },
              { key: 'interview', label: 'Interview', sub: 'TBD', icon: 'video', state: 'pending' },
              { key: 'decision', label: 'Decision', sub: '', icon: 'star', state: 'pending' },
              { key: 'onboard', label: 'Onboarding', sub: '', icon: 'rocket', state: 'pending' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.key}>
                <div style={{ flex: '0 0 auto', textAlign: 'center', minWidth: 92 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 99, margin: '0 auto',
                    background: s.state === 'done' ? 'var(--purple-700)' : s.state === 'active' ? 'var(--card)' : 'var(--paper)',
                    border: '2px solid', borderColor: s.state === 'done' ? 'var(--purple-700)' : s.state === 'active' ? 'var(--purple-700)' : 'var(--ink-200)',
                    color: s.state === 'done' ? '#fff' : s.state === 'active' ? 'var(--purple-700)' : 'var(--ink-300)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: s.state === 'active' ? '0 0 0 4px var(--purple-100)' : 'none',
                  }}>
                    <Icon name={s.icon} size={16} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.state === 'pending' ? 'var(--ink-500)' : 'var(--ink-900)', marginTop: 8 }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 2 }}>{s.sub}</div>}
                </div>
                {i < arr.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, marginTop: 19,
                    background: s.state === 'done' ? 'var(--purple-700)' : 'var(--ink-100)',
                    borderRadius: 99,
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Active step note */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--purple-50)', border: '1px solid var(--purple-100)', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name="user" size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>Mike Tan, IT Manager — reviewing your application</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-700)', marginTop: 3, lineHeight: 1.5 }}>
                You'll typically hear back within 3–5 working days. We'll email you when there's an update.
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: submission summary + activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Submission summary */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Your submission</div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Read-only</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[
                ['Applicant', 'Juan Dela Cruz'],
                ['School', 'UP Diliman · BS CS, 4th year'],
                ['Required hours', '486 hrs'],
                ['Preferred end', 'Aug 12, 2026'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--ink-100)' }}>
                  <span style={{ color: 'var(--ink-500)' }}>{k}</span>
                  <span style={{ color: 'var(--ink-900)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, padding: '10px 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10 }}>
                <div style={{ width: 28, height: 36, borderRadius: 5, background: 'var(--rose-50)', border: '1px solid #f3c4cc', color: 'var(--rose-600)', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PDF</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>JuanDelaCruz_Resume_2026.pdf</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>2.4 MB</div>
                </div>
                <Icon name="eye" size={14} color="var(--ink-500)" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'eye', t: 'Mike Tan opened your application', s: '2 days ago', tone: 'purple' },
                { icon: 'mail', t: 'Confirmation email sent', s: 'Mar 18', tone: 'gray' },
                { icon: 'check', t: 'Application submitted', s: 'Mar 18', tone: 'green' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 99, flex: '0 0 auto',
                    background: a.tone === 'purple' ? 'var(--purple-50)' : a.tone === 'green' ? 'var(--green-50)' : 'var(--paper)',
                    color: a.tone === 'purple' ? 'var(--purple-700)' : a.tone === 'green' ? 'var(--green-600)' : 'var(--ink-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={a.icon} size={12} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-900)' }}>{a.t}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 2 }}>{a.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </BrowserChrome>
);

// ─── Withdraw confirmation modal variant ───────────
const TrackWithdrawFrame = () => (
  <BrowserChrome url="porti.comfac-it.com/apply/track/APP-2026-0142#withdraw" height={960}>
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Dimmed track page behind */}
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(2px)', opacity: .55 }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--paper)' }}>
          <div style={{ height: 60, background: 'var(--card)', borderBottom: '1px solid var(--ink-100)' }} />
        </div>
      </div>
      {/* Background tone */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--paper)', opacity: .85 }} />
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Modal */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: 460,
        background: 'var(--card)', borderRadius: 16,
        boxShadow: '0 30px 80px -20px rgba(0,0,0,.45), 0 8px 24px -8px rgba(0,0,0,.2)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Icon name="alert-triangle" size={26} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: -0.4, marginBottom: 6 }}>Withdraw application?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.55 }}>
            Application <span className="mono" style={{ color: 'var(--ink-900)', fontWeight: 600 }}>APP-2026-0142</span> will be removed from review. You can re-apply later, but you'll need to start a new application.
          </div>
        </div>
        <div style={{ padding: '16px 28px' }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>
            Reason <span style={{ color: 'var(--ink-500)', fontWeight: 500 }}>(optional, helps us improve)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: '1.5px solid var(--ink-200)', borderRadius: 10, padding: '10px 12px' }}>
            <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="e.g. accepted another internship" />
          </div>
        </div>
        <div style={{ padding: '8px 28px 24px', display: 'flex', gap: 8 }}>
          <button style={{ ...ghostBtn, flex: 1, justifyContent: 'center', border: '1.5px solid var(--ink-200)' }}>Keep application</button>
          <button style={{
            flex: 1,
            background: 'var(--rose-600)', color: '#fff', border: 'none',
            padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 6px 16px -8px rgba(190,18,60,.5)',
          }}>
            <Icon name="x" size={13} /> Withdraw
          </button>
        </div>
      </div>
    </div>
  </BrowserChrome>
);

// ─── Reusable bits ────────────────────────────────
const StepHeading = ({ title, sub }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>{title}</div>
    {sub && <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);
const Section = ({ title, topGap = 24 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: topGap, marginBottom: 12 }}>
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--purple-700)', textTransform: 'uppercase' }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }} />
  </div>
);
const Row = ({ cols = 2, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginTop: 12 }}>{children}</div>
);
const Field = ({ label, required, icon, value, placeholder, valid, type, suffix }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 5 }}>
      {label} {required && <span style={{ color: 'var(--rose-600)' }}>*</span>}
    </label>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--paper)', border: '1.5px solid', borderColor: valid ? 'var(--green-600)' : 'var(--ink-200)',
      borderRadius: 9, padding: '10px 12px',
    }}>
      {icon && <Icon name={icon} size={13} color="var(--ink-500)" />}
      <input type={type || 'text'} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit', minWidth: 0 }} defaultValue={value} placeholder={placeholder} />
      {suffix && <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{suffix}</span>}
      {valid && <Icon name="check-circle" size={13} color="var(--green-600)" />}
    </div>
  </div>
);
const NavRow = ({ back, primary, primaryIcon = 'arrow-right', disabled = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}>
    <button style={{ ...ghostBtn, border: '1.5px solid var(--ink-200)' }}>← {back}</button>
    <div style={{ flex: 1 }} />
    <button style={{ ...primaryBtn, padding: '11px 22px', fontSize: 13.5, opacity: disabled ? .4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {primary} <Icon name={primaryIcon} size={14} />
    </button>
  </div>
);

const primaryBtn = {
  background: 'var(--purple-700)', color: '#fff', border: 'none',
  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)',
};
const ghostBtn = {
  background: 'var(--card)', border: '1.5px solid var(--ink-200)', color: 'var(--ink-700)',
  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};
const iconBtn = {
  background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 8,
  padding: 8, cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

window.ApplyVerifyFrame = ApplyVerifyFrame;
window.ApplyDetailsFrame = ApplyDetailsFrame;
window.ApplyResumeFrame = ApplyResumeFrame;
window.ApplyCoverFrame = ApplyCoverFrame;
window.ApplySuccessFrame = ApplySuccessFrame;
window.TrackApplicationFrame = TrackApplicationFrame;
window.TrackWithdrawFrame = TrackWithdrawFrame;
