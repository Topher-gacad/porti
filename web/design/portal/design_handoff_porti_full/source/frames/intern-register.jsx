// Intern Registration v3 — compact modal, sits over the login page
// Single ~520px card, 4 steps, no full-page takeover.
// The login page is dimmed behind the modal so the user knows where they are.

const InternRegFrame = ({ width = 1280, height = 820, step = 0 }) => {
  const PoroMark = window.PoroMark;
  const stepNames = ['Invite', 'About you', 'Internship', 'Password'];
  const isSuccess = step >= 4;

  return (
    <BrowserChrome url="porti.comfac-it.com/register/intern" height={height}>
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Dimmed login page behind */}
        <BehindLogin />
        {/* No dim overlay — modal sits on the same paper canvas as login */}

        {/* Modal */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '100%', maxWidth: isSuccess ? 460 : 520,
          background: 'var(--card)', borderRadius: 16,
          boxShadow: '0 30px 80px -20px rgba(0,0,0,.45), 0 8px 24px -8px rgba(0,0,0,.2)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          {!isSuccess && (
            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PoroMark size={22} color="var(--purple-700)" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: -0.5, color: 'var(--ink-900)' }}>
                  Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
                </span>
              </div>
              <Icon name="x" size={16} color="var(--ink-500)" style={{ cursor: 'pointer' }} />
            </div>
          )}

          {/* Compact dot stepper */}
          {!isSuccess && (
            <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              {stepNames.map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{
                    width: i === step ? 28 : 8, height: 8, borderRadius: 99,
                    background: i <= step ? 'var(--purple-700)' : 'var(--ink-100)',
                    transition: 'all .2s',
                  }} />
                </React.Fragment>
              ))}
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>
                {step + 1} / 4 · {stepNames[step]}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ padding: '20px 24px 22px' }}>
            {step === 0 && <StepInvite />}
            {step === 1 && <StepPersonal />}
            {step === 2 && <StepInternship />}
            {step === 3 && <StepPasswordReview />}
            {isSuccess && <StepSuccess PoroMark={PoroMark} />}
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
};

// ─── Background — identical to login.jsx (paper + same two glow circles) ───
const BehindLogin = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
  </div>
);

// ─── Step 1 ───────────────────────────────────────
const StepInvite = () => {
  const code1 = ['7', 'X', '4', 'Q'];
  const code2 = ['', '', '', ''];
  const seg = (filled, focused) => ({
    width: 44, height: 52, borderRadius: 10,
    background: 'var(--paper)',
    border: '1.5px solid', borderColor: focused ? 'var(--purple-600)' : 'var(--ink-200)',
    boxShadow: focused ? '0 0 0 3px var(--purple-100)' : 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 19, fontWeight: 700, color: 'var(--ink-900)',
    fontFamily: "'JetBrains Mono', monospace",
  });
  return (
    <>
      <Heading title="Enter your invite code" sub="Your administrator generated an 8-character code for you." />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {code1.map((c, i) => <div key={'a'+i} style={seg(true, false)}>{c}</div>)}
        <div style={{ width: 10, height: 2, background: 'var(--ink-300)', borderRadius: 99 }} />
        {code2.map((c, i) => <div key={'b'+i} style={seg(false, i === 0)}>{c}</div>)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-500)', textAlign: 'center', marginTop: 12 }}>
        <Icon name="info" size={11} /> Code expires 72 hours after generation · paste to auto-fill
      </div>
      <button style={{ ...primaryBtn, width: '100%', justifyContent: 'center', marginTop: 20 }}>
        Verify code <Icon name="arrow-right" size={14} />
      </button>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--ink-500)' }}>
        Already registered? <span style={{ color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Sign in</span>
      </div>
    </>
  );
};

// ─── Step 2 ───────────────────────────────────────
const StepPersonal = () => (
  <>
    <Heading title="About you" sub="Use your real name — it appears on tickets you file." />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Field label="First name" required value="Jane" />
      <Field label="Last name" required value="Doe" />
    </div>
    <Field label="Personal email" required icon="mail" value="jane.doe@gmail.com" valid />
    <Field label="Phone" icon="phone" placeholder="+63 9XX XXX XXXX" optional />
    <NavRow primary="Continue" />
  </>
);

// ─── Step 3 ───────────────────────────────────────
const StepInternship = () => (
  <>
    <Heading title="About your internship" sub="Helps us route requests and set the access expiry." />
    <Field label="School" required icon="book" value="University of the Philippines" valid />
    <div style={{ marginTop: 12 }}>
      <label style={fLabel}>Department <span style={{ color: 'var(--rose-600)' }}>*</span></label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
      {[
        ['monitor', 'IT — Infrastructure', true],
        ['code', 'IT — Apps', false],
        ['briefcase', 'Operations', false],
        ['users', 'HR', false],
      ].map(([icon, name, active]) => (
        <div key={name} style={{
          padding: '10px 12px', borderRadius: 10,
          background: active ? 'var(--purple-50)' : 'var(--paper)',
          border: '1.5px solid', borderColor: active ? 'var(--purple-600)' : 'var(--ink-100)',
          cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center',
          boxShadow: active ? '0 0 0 3px var(--purple-100)' : 'none',
        }}>
          <Icon name={icon} size={13} color={active ? 'var(--purple-700)' : 'var(--ink-500)'} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-900)' }}>{name}</span>
        </div>
      ))}
    </div>
    </div>
    {/* Compact date range */}
    <div style={{ marginTop: 12 }}>
      <label style={fLabel}>Internship period <span style={{ color: 'var(--rose-600)' }}>*</span></label>
    <div style={{
      display: 'flex', alignItems: 'center', background: 'var(--paper)',
      border: '1.5px solid var(--ink-200)', borderRadius: 10, padding: '8px 12px', gap: 10,
    }}>
      <Icon name="calendar" size={13} color="var(--ink-500)" />
      <div style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 500 }}>May 12 – Aug 12, 2026</div>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-500)' }}>3 months</span>
    </div>
    </div>
    <NavRow primary="Continue" />
  </>
);

// ─── Step 4 ───────────────────────────────────────
const StepPasswordReview = () => {
  // Sections collapse by default — keeps modal short even with many fields.
  const sections = [
    {
      key: 'personal', icon: 'user', title: 'Personal',
      fields: [
        ['Full name', 'Jane Marie Doe'],
        ['Personal email', 'jane.doe@gmail.com'],
        ['Phone', '+63 917 555 0142'],
        ['Date of birth', 'Mar 14, 2003'],
        ['Address', '12 Katipunan Ave, Quezon City'],
        ['Emergency contact', 'Maria Doe · +63 917 555 0199'],
      ],
      open: false,
    },
    {
      key: 'internship', icon: 'graduation', title: 'Internship',
      fields: [
        ['School', 'University of the Philippines'],
        ['Course / Year', 'BS Computer Science · 4th year'],
        ['Department', 'IT — Infrastructure'],
        ['Supervisor', 'Mike Tan · IT Manager'],
        ['Period', 'May 12 – Aug 12, 2026 (3 months)'],
        ['Required hours', '486 hrs'],
        ['Work setup', 'Hybrid · 3 days onsite'],
      ],
      open: true, // one section pre-open so user sees the pattern
    },
  ];
  return (
    <>
      <Heading title="Secure your account" sub="Pick a password and review your details before submitting." />

      {/* Password */}
      <Field label="Password" required icon="lock" value="••••••••••••" type="password" />
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= 3 ? 'var(--green-600)' : 'var(--ink-100)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>Strong</span>
        <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>12+ chars · upper · number</span>
      </div>

      {/* Review — collapsible sections, scrollable if tall */}
      <div style={{ marginTop: 20, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--ink-100)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-900)' }}>Review your details</span>
          <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{sections.reduce((n, s) => n + s.fields.length, 0)} fields</span>
        </div>
        <div style={{ maxHeight: 180, overflowY: 'auto' }}>
          {sections.map(s => (
            <div key={s.key} style={{ borderBottom: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', cursor: 'pointer', background: s.open ? 'var(--card)' : 'transparent' }}>
                <Icon name={s.icon} size={13} color="var(--purple-700)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-900)' }}>{s.title}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>· {s.fields.length} fields</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--purple-700)', fontWeight: 600 }}>Edit</span>
                  <Icon name={s.open ? 'chevron-up' : 'chevron-down'} size={12} color="var(--ink-500)" />
                </span>
              </div>
              {s.open && (
                <div style={{ padding: '4px 14px 12px', display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 6, columnGap: 10, fontSize: 11.5 }}>
                  {s.fields.map(([k, v]) => (
                    <React.Fragment key={k}>
                      <div style={{ color: 'var(--ink-500)' }}>{k}</div>
                      <div style={{ color: 'var(--ink-900)', fontWeight: 500 }}>{v}</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, fontSize: 11.5, color: 'var(--ink-700)', cursor: 'pointer', lineHeight: 1.5 }}>
        <span style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid var(--purple-700)', background: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: 1 }}>
          <Icon name="check" size={10} color="#fff" />
        </span>
        I agree to Porti's <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>Terms</span> and <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>Privacy Policy</span>.
      </label>

      <NavRow primary="Create account" primaryIcon="check" />
    </>
  );
};

// ─── Step 5 (success) ─────────────────────────────
const StepSuccess = ({ PoroMark }) => (
  <div style={{ textAlign: 'center', padding: '8px 0' }}>
    <div style={{
      width: 64, height: 64, margin: '0 auto 16px',
      borderRadius: 99, background: 'var(--purple-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <PoroMark size={36} color="var(--purple-700)" />
      <div style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 24, height: 24, borderRadius: 99, background: 'var(--green-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2.5px solid var(--card)',
      }}>
        <Icon name="check" size={12} color="#fff" />
      </div>
    </div>
    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink-900)' }}>You're in, Jane!</div>
    <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.5, padding: '0 12px' }}>
      A confirmation has been sent to <b style={{ color: 'var(--ink-900)' }}>jane.doe@gmail.com</b>. Mike Tan has been notified.
    </div>
    <button style={{ ...primaryBtn, width: '100%', justifyContent: 'center', marginTop: 20 }}>
      Go to dashboard <Icon name="arrow-right" size={14} />
    </button>
  </div>
);

// ─── Reusable bits ────────────────────────────────
const Heading = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink-900)' }}>{title}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);
const Field = ({ label, required, optional, icon, value, placeholder, valid, type }) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <label style={fLabel}>
        {label} {required && <span style={{ color: 'var(--rose-600)' }}>*</span>}
      </label>
      {optional && <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Optional</span>}
    </div>
    <div style={{ ...fWrap, borderColor: valid ? 'var(--green-600)' : 'var(--ink-200)' }}>
      {icon && <Icon name={icon} size={13} color="var(--ink-500)" />}
      <input type={type || 'text'} style={fInput} defaultValue={value} placeholder={placeholder} />
      {valid && <Icon name="check-circle" size={13} color="var(--green-600)" />}
    </div>
  </div>
);
const NavRow = ({ primary, primaryIcon = 'arrow-right' }) => (
  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
    <button style={ghostBtn}>← Back</button>
    <button style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>{primary} <Icon name={primaryIcon} size={14} /></button>
  </div>
);

const fLabel = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 5 };
const fWrap = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'var(--paper)', border: '1.5px solid var(--ink-200)',
  borderRadius: 9, padding: '10px 12px',
};
const fInput = { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: 'var(--ink-900)', fontFamily: 'inherit' };
const primaryBtn = {
  background: 'var(--purple-700)', color: '#fff', border: 'none',
  padding: '10px 18px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)',
};
const ghostBtn = {
  background: 'transparent', border: '1.5px solid var(--ink-200)', color: 'var(--ink-700)',
  padding: '10px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

window.InternRegFrame = InternRegFrame;
