// Login — single email + password (role server-derived). Plus full auth flow.
// States: default · loading · error variants · 2FA · forgot password flow.

const ErrorBanner = ({ msg, tone = 'rose' }) => (
  <div style={{
    background: tone === 'amber' ? 'var(--amber-50)' : 'var(--rose-50)',
    color: tone === 'amber' ? 'var(--amber-600)' : 'var(--rose-600)',
    border: '1px solid', borderColor: tone === 'amber' ? '#fde68a' : '#f3c4cc',
    borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 500,
    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14,
  }}>
    <Icon name="alert" size={14} style={{ marginTop: 1, flex: '0 0 auto' }} />
    <span>{msg}</span>
  </div>
);

const LoginShell = ({ children, title = 'Sign in to Porti', sub = "Use your COMFAC work credentials — we'll take you to the right place." }) => (
  <BrowserChrome url="porti.comfac-it.com/login" height={820}>
    <div className="frame" style={{ width: '100%', height: '100%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 880, position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1.05fr', background: 'var(--card)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--ink-100)', boxShadow: '0 30px 80px -30px rgba(39,32,48,.18), 0 8px 24px -12px rgba(39,32,48,.08)' }}>
        <div style={{ background: 'var(--card)', borderRight: '1px solid var(--ink-100)', padding: '36px 36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, var(--purple-50) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <Logo size={16} />
            <div style={{ marginTop: 36, fontSize: 26, lineHeight: 1.2, letterSpacing: -0.6, fontWeight: 700, color: 'var(--ink-900)', textWrap: 'balance', maxWidth: 320 }}>
              Welcome back.<br/>Sign in to <span style={{ color: 'var(--purple-700)' }}>Porti.</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.55, maxWidth: 320 }}>
              File requests, track tickets, and access COMFAC IT services — all in one place.
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36 }}>
            {[['check-circle', 'Track every ticket you file in one feed'], ['users', 'Direct hand-off to the right IT team']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ink-700)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, flex: '0 0 auto', background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={icon} size={13} />
                </div>
                {text}
              </div>
            ))}
            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-500)' }}>
              Need access? Email <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>it@comfac-it.com</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--card)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4, color: 'var(--ink-900)' }}>{title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 22 }}>{sub}</div>
          {children}
        </div>
      </div>
    </div>
  </BrowserChrome>
);

const PasswordField = ({ revealed, value = '', placeholder = 'Enter your password', error, capsLock }) => (
  <>
    <div style={{ ...fieldWrap, borderColor: error ? 'var(--rose-600)' : 'var(--ink-100)' }}>
      <Icon name="lock" size={14} color="var(--ink-500)" />
      <input type={revealed ? 'text' : 'password'} style={fieldInput} placeholder={placeholder} defaultValue={value} />
      <Icon name={revealed ? 'eye-off' : 'eye'} size={14} color={revealed ? 'var(--purple-700)' : 'var(--ink-500)'} style={{ cursor: 'pointer' }} />
    </div>
    {capsLock && (
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--amber-600)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="alert" size={11} /> Caps Lock is on
      </div>
    )}
  </>
);

// Default login (no role selector)
const LoginFrameNoRole = ({ state = 'default' }) => {
  const errors = {
    error: { msg: 'Email or password incorrect. Try again.', tone: 'rose' },
    locked: { msg: 'Account locked after 5 failed attempts. Try again in 14:32 or reset your password.', tone: 'rose' },
    expired: { msg: 'Your password expired. You need to set a new one before signing in.', tone: 'amber' },
    'not-in-directory': { msg: "We can't find this email in the COMFAC directory. Did you mean a different account?", tone: 'rose' },
  };
  const e = errors[state];
  const loading = state === 'loading';
  return (
    <LoginShell>
      {e && <ErrorBanner msg={e.msg} tone={e.tone} />}

      <label style={fieldLabel}>Work email</label>
      <div style={{ ...fieldWrap, borderColor: state === 'not-in-directory' ? 'var(--rose-600)' : 'var(--ink-100)' }}>
        <Icon name="mail" size={14} color="var(--ink-500)" />
        <input style={fieldInput} placeholder="you@comfac-it.com" defaultValue={state !== 'default' ? 'jdoe@comfac-it.com' : ''} />
        {state !== 'default' && state !== 'not-in-directory' && <Icon name="check-circle" size={14} color="var(--green-600)" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14 }}>
        <label style={fieldLabel}>Password</label>
        <a style={{ fontSize: 11, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Forgot?</a>
      </div>
      <PasswordField revealed={state === 'expired'} value={state !== 'default' && state !== 'not-in-directory' ? '••••••••' : ''} error={state === 'error' || state === 'locked'} capsLock={state === 'error'} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12, color: 'var(--ink-700)', cursor: 'pointer' }}>
        <span style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid var(--ink-300)', background: 'var(--card)' }} />
        Keep me signed in
      </label>

      <button disabled={loading} style={{
        width: '100%', marginTop: 22,
        background: loading ? 'var(--purple-600)' : 'var(--purple-700)', color: '#fff',
        border: 'none', padding: '12px 16px', borderRadius: 10,
        fontSize: 13.5, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 1px 0 rgba(255,255,255,.15) inset, 0 6px 16px -8px rgba(91,77,200,.5)',
        opacity: loading ? 0.85 : 1,
      }}>
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'porti-spin 0.7s linear infinite' }} />
            Signing in…
          </>
        ) : <>Sign in <Icon name="arrow-right" size={14} /></>}
      </button>

      <style>{`@keyframes porti-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-500)', textAlign: 'center' }}>
        New here? <span style={{ color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Request access</span>
      </div>

      {/* Last sign-in footnote — quiet trust signal */}
      <div style={{ marginTop: 20, padding: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, fontSize: 11, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clock" size={11} color="var(--ink-500)" />
        Last sign-in: 2 days ago · Manila HQ · macOS
      </div>
    </LoginShell>
  );
};

// 2FA step — 6-digit TOTP
const Login2FAFrame = ({ state = 'default' }) => {
  const code = state === 'wrong' ? ['8', '4', '2', '9', '1', '7'] : ['8', '4', '2', '9', '', ''];
  return (
    <LoginShell title="One more step" sub="Enter the 6-digit code from your authenticator app.">
      {state === 'wrong' && <ErrorBanner msg="That code didn't match. Authenticator codes refresh every 30 seconds." />}

      <div style={{ marginBottom: 12, padding: 10, background: 'var(--purple-50)', border: '1px solid var(--purple-200, #c4b5fd)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="shield" size={13} color="var(--purple-700)" />
        Signed in as <b style={{ color: 'var(--ink-900)' }}>jdoe@comfac-it.com</b>
      </div>

      <label style={fieldLabel}>Verification code</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {code.map((c, i) => {
          const focused = i === code.findIndex(x => !x);
          const err = state === 'wrong';
          return (
            <div key={i} style={{
              flex: 1, height: 52, borderRadius: 10,
              background: 'var(--paper)',
              border: '1.5px solid',
              borderColor: err ? 'var(--rose-600)' : focused ? 'var(--purple-600)' : c ? 'var(--ink-200)' : 'var(--ink-100)',
              boxShadow: focused && !err ? '0 0 0 3px var(--purple-100)' : err ? '0 0 0 3px rgba(190,18,60,.12)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: err ? 'var(--rose-600)' : 'var(--ink-900)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{c}</div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-500)', marginBottom: 16 }}>
        <span><Icon name="clock" size={11} /> Code refreshes in <b style={{ color: 'var(--ink-900)' }}>00:18</b></span>
        <span style={{ color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Use a backup code</span>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 12, color: 'var(--ink-700)', cursor: 'pointer' }}>
        <span style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid var(--purple-600)', background: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={10} color="#fff" />
        </span>
        Trust this device for 30 days
      </label>

      <button style={{ width: '100%', background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)' }}>
        Verify &amp; sign in <Icon name="arrow-right" size={14} />
      </button>

      <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-500)', textAlign: 'center' }}>
        <span style={{ cursor: 'pointer' }}>← Back to sign in</span>
      </div>
    </LoginShell>
  );
};

// Forgot password — multi-step flow
const ForgotPasswordFrame = ({ step = 'email' }) => {
  if (step === 'email') {
    return (
      <LoginShell title="Reset your password" sub="Enter the email you sign in with — we'll send you a reset link.">
        <label style={fieldLabel}>Work email</label>
        <div style={fieldWrap}>
          <Icon name="mail" size={14} color="var(--ink-500)" />
          <input style={fieldInput} placeholder="you@comfac-it.com" />
        </div>
        <button style={{ width: '100%', marginTop: 22, background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)' }}>
          Send reset link <Icon name="send" size={14} />
        </button>
        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-500)', textAlign: 'center' }}>
          <span style={{ cursor: 'pointer' }}>← Back to sign in</span>
        </div>
      </LoginShell>
    );
  }
  if (step === 'sent') {
    return (
      <LoginShell title="Check your inbox" sub="If an account exists for that email, we've sent a reset link. It expires in 15 minutes.">
        <div style={{ padding: 18, background: 'var(--purple-50)', border: '1px solid var(--purple-200, #c4b5fd)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Icon name="mail" size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Email sent to jdoe@comfac-it.com</div>
            <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 4, lineHeight: 1.55 }}>Click the link in the email to set a new password. Don't see it? Check your spam folder.</div>
          </div>
        </div>
        <button style={{ width: '100%', background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Resend in <span className="mono">00:58</span>
        </button>
        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-500)', textAlign: 'center' }}>
          <span style={{ cursor: 'pointer' }}>← Back to sign in</span>
        </div>
      </LoginShell>
    );
  }
  if (step === 'new') {
    return (
      <LoginShell title="Set a new password" sub="Choose something you'll remember. 12 characters minimum.">
        <label style={fieldLabel}>New password</label>
        <PasswordField revealed value="••••••••••" />
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= 3 ? 'var(--green-600)' : 'var(--ink-100)' }} />)}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>Strong · 12+ chars · upper · number</div>

        <div style={{ marginTop: 14 }}>
          <label style={fieldLabel}>Confirm password</label>
          <PasswordField value="••••••••••" />
        </div>

        <button style={{ width: '100%', marginTop: 22, background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)' }}>
          Save &amp; sign in <Icon name="check" size={14} />
        </button>
      </LoginShell>
    );
  }
  // success
  return (
    <LoginShell title="Password updated" sub="You're all set. Use your new password to sign in.">
      <div style={{ padding: 22, background: 'var(--green-50)', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--green-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Icon name="check" size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>You're good to go.</div>
          <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 2 }}>Sessions on other devices have been signed out.</div>
        </div>
      </div>
      <button style={{ width: '100%', background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 6px 16px -8px rgba(91,77,200,.5)' }}>
        Continue to Porti <Icon name="arrow-right" size={14} />
      </button>
    </LoginShell>
  );
};

const fieldLabel = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6 };
const fieldWrap = { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: '10px 12px', transition: 'border-color .15s, box-shadow .15s' };
const fieldInput = { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink-900)', fontFamily: 'inherit' };

window.LoginFrameNoRole = LoginFrameNoRole;
window.LoginFrame = LoginFrameNoRole; // alias for backward compat
window.Login2FAFrame = Login2FAFrame;
window.ForgotPasswordFrame = ForgotPasswordFrame;
