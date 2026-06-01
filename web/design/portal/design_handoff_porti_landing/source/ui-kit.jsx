// Shared UI kit for COMFAC IT portal redesign frames
// All frames consume these — keeps consistency across artboards.

// SVG icon set — outlined, 1.5px stroke, matches Lucide / Heroicons family
const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.75, style }) => {
  const paths = {
    "refresh-cw": <><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></>,
    "life-buoy": <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m6.7 6.7 2.8 2.8"/><path d="m14.5 14.5 2.8 2.8"/><path d="m6.7 17.3 2.8-2.8"/><path d="m14.5 9.5 2.8-2.8"/></>,
    "clipboard-check": <><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 7h6"/><path d="m9 14 2 2 4-4"/></>,
    "monitor": <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>,
    "user": <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    "shield": <><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/></>,
    "wrench": <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.6-2.6 2.5-2.5-1-.4Z"/></>,
    "graduation": <><path d="m12 4-10 5 10 5 10-5-10-5Z"/><path d="M6 11v4c2 2 4 3 6 3s4-1 6-3v-4"/></>,
    "lock": <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    "mail": <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    "eye": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    "eye-off": <><path d="M3 3l18 18"/><path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4"/><path d="M6.5 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    "search": <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    "bell": <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    "plus": <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    "arrow-right": <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    "arrow-left": <><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>,
    "check": <><path d="m5 12 5 5 9-12"/></>,
    "check-circle": <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></>,
    "clock": <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    "alert": <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".8" fill="currentColor"/></>,
    "x": <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    "menu": <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    "chevron-right": <><path d="m9 6 6 6-6 6"/></>,
    "chevron-down": <><path d="m6 9 6 6 6-6"/></>,
    "external": <><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v6H4V6h6"/></>,
    "filter": <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></>,
    "settings": <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    "logout": <><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></>,
    "home": <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    "inbox": <><path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6l2-8Z"/></>,
    "book": <><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z"/><path d="M4 5v13a2 2 0 0 1 2-2h13"/></>,
    "users": <><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-5-5"/></>,
    "sparkle": <><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/><path d="m6 6 4 4"/><path d="m14 14 4 4"/><path d="m18 6-4 4"/><path d="m10 14-4 4"/></>,
    "paperclip": <><path d="m21 11-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></>,
    "send": <><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></>,
    "key": <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9"/><path d="m17 6 3 3"/><path d="m14 9 3 3"/></>,
    "device-mobile": <><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></>,
    "logo-comfac": null, // rendered separately
  };
  if (!paths[name]) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

// Wordmark — Porti name + Poro mark.
const Logo = ({ size = 16, light = false }) => {
  const PoroMark = window.PoroMark;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.45 }}>
      {PoroMark && <PoroMark size={size * 1.6} color={light ? '#fff' : 'var(--purple-700)'} />}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 800, fontSize: size * 1.4, letterSpacing: -size * 0.04,
        color: light ? '#fff' : 'var(--ink-900)',
      }}>
        Porti<span style={{ color: light ? 'var(--purple-500)' : 'var(--purple-700)' }}>.</span>
      </div>
    </div>
  );
};

// Browser chrome wrapper — gives the artboards that "live web app" feel
const BrowserChrome = ({ url = "portal.comfac-it.com", children, height = 920 }) => (
  <div style={{
    width: '100%', height, background: '#e7e3da', borderRadius: 12,
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 1px 0 rgba(0,0,0,.04) inset',
  }}>
    <div style={{
      height: 36, background: 'var(--ink-900)', display: 'flex', alignItems: 'center',
      gap: 8, padding: '0 14px', flex: '0 0 auto',
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
      </div>
      <div style={{
        flex: 1, height: 22, background: 'rgba(255,255,255,.12)', borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 11, fontWeight: 500,
        marginLeft: 8,
      }}>
        <span style={{ opacity: .6, marginRight: 6 }}>🔒</span>{url}
      </div>
    </div>
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  </div>
);

// Status pill
const Pill = ({ tone = 'gray', children, style }) => {
  const tones = {
    gray:   { bg: 'var(--ink-100)', fg: 'var(--ink-700)' },
    green:  { bg: 'var(--green-50)', fg: 'var(--green-600)' },
    amber:  { bg: 'var(--amber-50)', fg: 'var(--amber-600)' },
    blue:   { bg: 'var(--blue-50)',  fg: 'var(--blue-600)' },
    rose:   { bg: 'var(--rose-50)',  fg: 'var(--rose-600)' },
    violet: { bg: 'var(--violet-50)', fg: 'var(--violet-600)' },
    orange: { bg: 'var(--orange-50)', fg: 'var(--orange-600)' },
    maroon: { bg: 'var(--purple-100)', fg: 'var(--purple-800)' },
    purple: { bg: 'var(--purple-100)', fg: 'var(--purple-800)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
      background: tones.bg, color: tones.fg,
      ...style,
    }}>{children}</span>
  );
};

// Annotation note — for the Figma feel
const Note = ({ children, style }) => (
  <div style={{
    background: '#fef4a8', color: '#5a4a2a',
    padding: '10px 12px', borderRadius: 6,
    fontSize: 12, lineHeight: 1.45,
    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    fontFamily: "'Inter', sans-serif",
    transform: 'rotate(-.4deg)',
    maxWidth: 220,
    ...style,
  }}>{children}</div>
);

// Service tile glyph — small colored square that stands in for the real app icon
const ServiceGlyph = ({ letter, color, bg }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 10,
    background: bg, color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, letterSpacing: -0.5,
    flex: '0 0 auto',
  }}>{letter}</div>
);

window.Icon = Icon;
window.Logo = Logo;
window.BrowserChrome = BrowserChrome;
window.Pill = Pill;
window.Note = Note;
window.ServiceGlyph = ServiceGlyph;
