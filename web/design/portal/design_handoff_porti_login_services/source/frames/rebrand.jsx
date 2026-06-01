// Porti — rebrand logo exploration frame
// Concept: stylized Poro emblem (League of Legends — small, fluffy, two horns + dot eyes)
// Simplified to a clean geometric mark that reads at any size.

// Faceless Poro silhouette — round cloud-like body + two soft tufted horns.
// No eyes, no mouth. The 'P' for Porti is carved into the body as negative space.
const PoroMark = ({ size = 120, color = 'var(--purple-700)', bg = 'transparent' }) => {
  const uid = React.useId();
  return (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ background: bg, borderRadius: 12 }}>
    <defs>
      <mask id={`poro-${uid}`}>
        <rect width="100" height="100" fill="#fff" />
        {/* 'P' carved into the body */}
        <path d="M42 44 V70 M42 44 H54 a7 7 0 0 1 0 14 H42" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </mask>
    </defs>
    <g mask={`url(#poro-${uid})`}>
      {/* Two soft tufted horns — rounded teardrops, leaning slightly outward */}
      <path d="M34 24 Q30 12 38 14 Q42 20 40 30 Q37 32 34 30 Z" fill={color} />
      <path d="M66 24 Q70 12 62 14 Q58 20 60 30 Q63 32 66 30 Z" fill={color} />
      {/* Cloud-like body — wider at the bottom, gently rounded top */}
      <path d="M20 58 Q20 32 50 30 Q80 32 80 58 Q80 82 50 82 Q20 82 20 58 Z" fill={color} />
    </g>
  </svg>
  );
};





const Wordmark = ({ size = 32, mark = 'purple', italic = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <PoroMark size={size * 1.3} color={mark === 'purple' ? 'var(--purple-700)' : 'var(--ink-900)'} />
    <div style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 800, fontSize: size, letterSpacing: -1.2,
      fontStyle: italic ? 'italic' : 'normal',
      color: 'var(--ink-900)',
    }}>
      Porti<span style={{ color: mark === 'purple' ? 'var(--purple-700)' : 'var(--ink-900)' }}>.</span>
    </div>
  </div>
);

const RebrandFrame = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--paper)', overflow: 'auto', fontFamily: "'Inter', sans-serif" }}>
    {/* Hero */}
    <div style={{ padding: '40px 48px 28px', borderBottom: '1px solid var(--ink-100)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--purple-700)', textTransform: 'uppercase', marginBottom: 8 }}>Rebrand exploration</div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.2, color: 'var(--ink-900)' }}>From COMFAC IT Service Portal → <span style={{ color: 'var(--purple-700)' }}>Porti.</span></div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 6, maxWidth: 580, lineHeight: 1.55 }}>
        Friendlier, shorter, easier to say. The mark is an abstracted Poro silhouette — a soft cloud-like body with two tufted horns, and a 'P' for Porti carved into the body as negative space. No face.
      </div>
    </div>

    {/* Primary lockup */}
    <div style={{ padding: '32px 48px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32, alignItems: 'center' }}>
      <div style={{
        background: 'var(--card)', borderRadius: 18, padding: '64px 48px',
        border: '1px solid var(--ink-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        <PoroMark size={180} />
        <Wordmark size={56} />
        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>Primary lockup · purple on paper</div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 12 }}>The mark, broken down</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.55 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>1</span>
            <span><b>Tufted horns.</b> Two soft teardrops on top — the Poro silhouette without any face details that could feel off-brand or unfriendly.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>2</span>
            <span><b>Cloud-like body.</b> A single rounded shape, slightly wider at the base. Reads as approachable and friendly at any size.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>3</span>
            <span><b>'P' negative space.</b> The Porti initial is cut into the body — the mark does double duty as a Poro silhouette and a monogram.</span>
          </div>
        </div>
      </div>
    </div>

    {/* Variants */}
    <div style={{ padding: '8px 48px 32px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 14 }}>Variants</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Primary · Purple', node: <PoroMark size={100} color="var(--purple-700)" />, bg: 'var(--card)' },
          { label: 'Mono · Ink', node: <PoroMark size={100} color="var(--ink-900)" />, bg: 'var(--card)' },
          { label: 'Reversed · on Purple', node: <PoroMark size={100} color="#fff" />, bg: 'var(--purple-700)' },
          { label: 'Reversed · on Ink', node: <PoroMark size={100} color="#fff" />, bg: 'var(--ink-900)' },
        ].map(v => (
          <div key={v.label} style={{ background: v.bg, borderRadius: 14, padding: 28, border: '1px solid var(--ink-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {v.node}
            <div style={{ fontSize: 11, color: v.bg === 'var(--card)' ? 'var(--ink-500)' : 'rgba(255,255,255,.7)', fontWeight: 500 }}>{v.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Scale test */}
    <div style={{ padding: '8px 48px 32px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 14 }}>Scale test</div>
      <div style={{ background: 'var(--card)', borderRadius: 14, padding: 28, border: '1px solid var(--ink-100)', display: 'flex', alignItems: 'flex-end', gap: 36, justifyContent: 'center' }}>
        {[16, 24, 32, 48, 72, 120].map(s => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <PoroMark size={s} />
            <span style={{ fontSize: 10, color: 'var(--ink-500)' }} className="mono">{s}px</span>
          </div>
        ))}
      </div>
    </div>

    {/* Wordmark lockups */}
    <div style={{ padding: '8px 48px 32px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 14 }}>Wordmark lockups</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: '36px 32px', border: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wordmark size={42} />
        </div>
        <div style={{ background: 'var(--ink-900)', borderRadius: 14, padding: '36px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PoroMark size={56} color="#fff" />
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 42, letterSpacing: -1.2, color: '#fff' }}>
              Porti<span style={{ color: 'var(--purple-500)' }}>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* In-context: browser tab + favicon + app icon */}
    <div style={{ padding: '8px 48px 48px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 14 }}>In context</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {/* Browser tab */}
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 18, border: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 12 }}>Browser tab</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--paper)', borderRadius: '10px 10px 0 0', maxWidth: 260 }}>
            <PoroMark size={14} />
            <span style={{ fontSize: 11, color: 'var(--ink-700)', fontWeight: 500 }}>Porti — Sign in</span>
            <Icon name="x" size={11} color="var(--ink-500)" style={{ marginLeft: 'auto' }} />
          </div>
        </div>
        {/* Favicon */}
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 18, border: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 12 }}>Favicon · 32px</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--purple-700)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PoroMark size={22} color="#fff" />
            </div>
            <div style={{ width: 32, height: 32, background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PoroMark size={22} />
            </div>
          </div>
        </div>
        {/* App icon */}
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 18, border: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 12 }}>App icon</div>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(140deg, var(--purple-600) 0%, var(--purple-800) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px rgba(91,77,200,.5)' }}>
            <PoroMark size={42} color="#fff" />
          </div>
        </div>
      </div>
    </div>

    {/* Color tokens */}
    <div style={{ padding: '8px 48px 60px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 14 }}>Brand tokens</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          ['Porti Purple', 'var(--purple-700)', '#5B4DC8', '#fff'],
          ['Lavender', 'var(--purple-600)', '#7B6FDC', '#fff'],
          ['Ink', 'var(--ink-900)', '#272030', '#fff'],
          ['Paper', 'var(--paper)', '#F6F4F9', 'var(--ink-900)'],
        ].map(([name, bg, hex, fg]) => (
          <div key={name} style={{ background: bg, color: fg, padding: 18, borderRadius: 12, border: bg === 'var(--paper)' ? '1px solid var(--ink-100)' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{name}</div>
            <div className="mono" style={{ fontSize: 11, opacity: .8, marginTop: 4 }}>{hex}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

window.RebrandFrame = RebrandFrame;
window.PoroMark = PoroMark;
