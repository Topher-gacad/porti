// Landing — scrollable single page, public.
// Sections: Header · Hero · Poro's Workshop · Shipped (timeline) · By the Numbers · Apps · Footer
// All content cards are stand-ins for admin-managed CMS posts.

const LandingFrame = ({ width = 1280, height = 3800 }) => (
  <BrowserChrome url="porti.comfac-it.com" height={height}>
    <div className="frame" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <LandingHeader />
      <LandingHero />
      <AppsSection />
      <PoroWorkshopSection />
      <ShippedTimelineSection />
      <ByTheNumbersSection />
      <LandingFooter />
    </div>
  </BrowserChrome>
);

const LandingHeader = () => (
  <header style={{
    height: 64, padding: '0 64px',
    background: 'rgba(251,250,253,.85)', backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--ink-100)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flex: '0 0 auto', position: 'sticky', top: 0, zIndex: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <Logo size={17} />
      <nav style={{ display: 'flex', gap: 22, fontSize: 13, color: 'var(--ink-700)' }}>
        <a style={navLink}>Workshop</a>
        <a style={navLink}>Shipped</a>
        <a style={navLink}>Services</a>
        <a style={navLink}>Status</a>
        <a style={navLink}>Help</a>
      </nav>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button style={primaryBtn}>Login <Icon name="arrow-right" size={14} /></button>
    </div>
  </header>
);

const LandingHero = () => {
  return (
  <section style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, padding: '72px 64px 80px', flex: '0 0 auto', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={eyebrow}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--green-600)' }} />
        All systems operational
      </div>
      <h1 style={{ fontSize: 60, lineHeight: 1.02, letterSpacing: -1.8, margin: '14px 0 18px', fontWeight: 700, color: 'var(--ink-900)', textWrap: 'balance' }}>
        All IT services,<br/>
        <span style={{ color: 'var(--purple-700)' }}>one portal.</span>
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-500)', margin: '0 0 28px', maxWidth: 480 }}>
        COMFAC's internal IT service portal. Submit a ticket, request access, or jump into one of our internal apps — all from a single sign-in.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
        <button style={{ ...primaryBtn, padding: '12px 18px', fontSize: 14 }}>Sign in to your account <Icon name="arrow-right" size={15} /></button>
        <button style={{ ...ghostBtn, padding: '12px 18px', fontSize: 14, border: '1px solid var(--ink-200)' }}>Browse services</button>
      </div>
      <div style={{ display: 'flex', gap: 28, color: 'var(--ink-500)', fontSize: 12 }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="users" size={14} /> 200+ COMFAC staff</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="clock" size={14} /> Avg. reply &lt; 4 hrs</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="shield" size={14} /> Backed by IT Infrastructure</span>
      </div>
    </div>
    <div style={{ position: 'relative', minHeight: 380 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, var(--purple-100) 0%, transparent 55%), radial-gradient(circle at 80% 80%, var(--purple-50) 0%, transparent 50%)', borderRadius: 20 }} />
      <div style={{ position: 'absolute', top: 30, right: 0, width: 320, background: 'var(--card)', borderRadius: 14, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--ink-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="refresh-cw" size={17} /></div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Change Request</div>
            <div style={{ fontSize: 10, color: 'var(--ink-500)' }}>#CR-1042 · Submitted 2h ago</div>
          </div>
          <Pill tone="amber" style={{ marginLeft: 'auto' }}>In review</Pill>
        </div>
        <div style={{ height: 1, background: 'var(--ink-100)', marginBottom: 14 }} />
        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 8 }}>Progress</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={progStep(true)} /><div style={progStep(true)} /><div style={progStep(false)} /><div style={progStep(false)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-500)', marginTop: 6 }}>
          <span>Submitted</span><span>Reviewed</span><span>Approved</span><span>Done</span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 0, width: 280, background: 'var(--card)', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--ink-100)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 10 }}>Quick action</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--paper)', borderRadius: 10 }}>
          <Icon name="search" size={15} color="var(--ink-500)" />
          <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Search services or apps…</span>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-300)', padding: '2px 6px', border: '1px solid var(--ink-200)', borderRadius: 4 }}>⌘K</span>
        </div>
      </div>
    </div>
  </section>
  );
};

// ─── Poro's Workshop ─────────────────────────────────────────
const workshopProjects = [
  { status: 'Beta', tone: 'blue', title: 'Self-serve WiFi vouchers', cat: 'Network', body: 'Captive-portal codes interns claim from a QR — no more printed vouchers on the wall.', eta: 'Late May', leads: ['JL', 'CG'], leadName: 'Jay Lim & 1 other' },
  { status: 'Building', tone: 'purple', title: 'Porti rebrand & redesign', cat: 'Portal', body: "We're rebuilding the IT portal from the ground up. You're looking at the new landing page.", eta: 'June', leads: ['TC', 'JC'], leadName: 'Topepe Cruz & 1 other' },
  { status: 'Planning', tone: 'amber', title: 'AI assistant for tickets', cat: 'Apps', body: 'Suggested replies and auto-classification so support tickets route themselves to the right team.', eta: 'Q3 · 26', leads: ['AR'], leadName: 'Aldo Reyes' },
];

const PoroWorkshopSection = () => {
  const PoroMark = window.PoroMark;
  return (
    <section id="workshop" style={{
      padding: '80px 64px',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--paper) 0%, var(--card) 100%)',
      borderTop: '1px solid var(--ink-100)',
      borderBottom: '1px solid var(--ink-100)',
    }}>
      {/* Soft blob — matches the lavender brand accent */}
      <style>{`
        @keyframes porti-blob-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes porti-blob-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .porti-blob-a { position: absolute; top: -160px; right: -120px; width: 520px; height: 520px; pointer-events: none;
                        animation: porti-blob-spin 60s linear infinite; }
        .porti-blob-b { position: absolute; bottom: -200px; left: -140px; width: 460px; height: 460px; pointer-events: none;
                        animation: porti-blob-spin 90s linear infinite reverse; }
        .porti-blob-c { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 360px; height: 360px;
                        pointer-events: none; animation: porti-blob-pulse 8s ease-in-out infinite; opacity: .6; }
      `}</style>

      <svg className="porti-blob-a" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-grad-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="var(--purple-100)" stopOpacity=".9" />
            <stop offset="60%" stopColor="var(--purple-50)"  stopOpacity=".4" />
            <stop offset="100%" stopColor="var(--purple-50)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-grad-a)" d="M44.6,-58.3C56.4,-49.7,63.1,-34.4,67.4,-18.6C71.7,-2.7,73.7,13.7,67.7,26.6C61.7,39.5,47.7,48.9,33.1,55.6C18.5,62.2,3.2,66.2,-12.4,65.1C-28,64,-43.9,57.9,-54.4,46.6C-64.9,35.3,-69.9,18.7,-69.6,2.4C-69.4,-13.9,-63.9,-29.9,-53.6,-39.3C-43.4,-48.6,-28.4,-51.3,-13.7,-55.5C0.9,-59.6,15.3,-65.3,32.8,-66.8Z" transform="translate(100 100)" />
      </svg>

      <svg className="porti-blob-b" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-grad-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="var(--purple-200, #c4b5fd)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--purple-50)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-grad-b)" d="M37.2,-52.5C48.2,-44.7,57,-33.8,61.7,-21.2C66.3,-8.5,66.7,5.9,62.5,18.5C58.3,31.2,49.4,42.1,38.1,49.6C26.9,57.1,13.4,61.2,-0.7,62.2C-14.9,63.2,-29.7,61.2,-41.2,53.6C-52.6,46,-60.7,32.8,-64.2,18.6C-67.6,4.5,-66.5,-10.6,-60.8,-23.4C-55.1,-36.3,-44.9,-46.9,-33.1,-54.2C-21.3,-61.4,-7.9,-65.4,2.9,-69.3Z" transform="translate(100 100)" />
      </svg>

      <svg className="porti-blob-c" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-grad-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="var(--purple-100)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--purple-50)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-grad-c)" d="M48.6,-66.4C61.1,-57.1,67.1,-40.4,69.7,-24.2C72.2,-7.9,71.3,7.9,65.1,21.4C58.8,35,47.2,46.2,33.7,54.6C20.1,62.9,4.6,68.3,-11.6,68.7C-27.7,69,-44.5,64.3,-55.6,53.6C-66.7,42.9,-72.1,26.3,-72.5,9.5C-72.9,-7.3,-68.3,-24.4,-58.6,-36.7C-48.9,-49,-34.1,-56.5,-19.4,-63C-4.7,-69.5,9.9,-75,23.7,-74C37.5,-72.9,50.5,-65.2,48.6,-66.4Z" transform="translate(100 100)" />
      </svg>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '4px 12px 4px 6px', background: 'var(--purple-50)', border: '1px solid var(--purple-100, #ddd6fe)', borderRadius: 99 }}>
            {PoroMark && <PoroMark size={20} color="var(--purple-700)" />}
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--purple-700)', textTransform: 'uppercase' }}>Porti's Workshop</span>
          </div>
          <h2 style={{ fontSize: 38, lineHeight: 1.1, letterSpacing: -1.2, fontWeight: 700, color: 'var(--ink-900)', margin: 0, maxWidth: 640 }}>
            On the <span style={{ color: 'var(--purple-700)' }}>workbench</span> right now.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-500)', marginTop: 10, maxWidth: 560, lineHeight: 1.55 }}>
            A peek behind the curtain. Projects the IT team is actively planning, building, or rolling out.
          </p>
        </div>
        <a style={{ fontSize: 13, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          See all projects <Icon name="arrow-right" size={13} />
        </a>
      </div>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {workshopProjects.map((p, i) => (
          <article key={i} style={{
            background: 'var(--card)',
            border: '1px solid var(--ink-100)',
            borderRadius: 18,
            padding: 28,
            display: 'flex', flexDirection: 'column', gap: 18,
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform .2s, box-shadow .2s',
            minHeight: 320,
            boxShadow: '0 1px 2px rgba(20,17,15,.05), 0 8px 24px -10px rgba(20,17,15,.10)',
          }}>
            {/* Top row: status chip + category */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                color: `var(--${p.tone}-600)`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: `var(--${p.tone}-600)`, boxShadow: `0 0 0 4px ${p.tone === 'blue' ? 'var(--blue-50)' : p.tone === 'purple' ? 'var(--purple-50)' : 'var(--amber-50)'}` }} />
                {p.status}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, padding: '3px 9px', background: 'var(--paper)', borderRadius: 99 }}>
                {p.cat}
              </span>
            </div>

            {/* Title + body */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: 24, fontWeight: 700, letterSpacing: -0.7,
                color: 'var(--ink-900)', margin: '0 0 10px',
                lineHeight: 1.15,
              }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>

            {/* Bottom: leads on left, ETA on right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex' }}>
                  {p.leads.map((l, j) => (
                    <span key={j} style={{
                      width: 30, height: 30, borderRadius: 99,
                      background: ['var(--purple-700)', 'var(--orange-600)', 'var(--blue-600)'][j % 3],
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2.5px solid var(--card)',
                      marginLeft: j > 0 ? -10 : 0,
                    }}>{l}</span>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-700)', fontWeight: 500 }}>{p.leadName}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-700)', fontWeight: 600 }}>
                <Icon name="calendar" size={12} color="var(--ink-500)" /> {p.eta}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// ─── Shipped Timeline ─────────────────────────────────────────
const shipped = [
  { date: 'May 2026', kind: 'release', icon: 'rocket', tone: 'green', title: 'Service Catalog launch', body: 'Pre-templated requests for the 12 most-asked-for things — VPN, new laptop, password reset, GitLab access. Skips the blank form for 65% of submissions.', metric: '−40% time to file', metricLabel: 'avg. first ticket', latest: true },
  { date: 'Apr 2026', kind: 'release', icon: 'shield', tone: 'purple', title: 'SLA monitoring & auto-routing', body: 'Tickets now auto-route to the right engineer based on type and load. Past-SLA alerts ping the lead before they breach.', metric: '96.4%', metricLabel: 'SLA compliance' },
  { date: 'Mar 2026', kind: 'release', icon: 'monitor', tone: 'blue', title: 'Synx FMS — phase 2 rollout', body: 'Facility maintenance now lives entirely in Synx. Mobile crew app, photo evidence on tickets, parts tracking.', metric: '14 sites', metricLabel: 'fully migrated' },
  { date: 'Feb 2026', kind: 'milestone', icon: 'award', tone: 'amber', title: 'Internship Program v2 kickoff', body: 'New onboarding flow with invite codes, attendance QR check-in, and weekly mentor 1:1s. 25 interns through so far this batch.' },
  { date: 'Jan 2026', kind: 'release', icon: 'mail', tone: 'rose', title: 'Mailcow upgrade & SPF/DKIM cleanup', body: 'Migrated to Mailcow 2024.10, fixed DMARC alignment for all 5 domains. Inbox-placement rate jumped overnight.', metric: '+34pp', metricLabel: 'inbox-placement' },
  { date: 'Dec 2025', kind: 'milestone', icon: 'check-circle', tone: 'green', title: 'ERPNext modules — 12 live', body: 'Sales, Inventory, Manufacturing, HR, Payroll, Accounts… all consolidated under one ERP. Old Excel sheets archived.' },
];

const ShippedTimelineSection = () => (
  <section id="shipped" style={{ padding: '80px 64px 96px', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
    {/* Ambient corner glow */}
    <div aria-hidden="true" style={{ position: 'absolute', top: -160, left: -120, width: 480, height: 480, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Centered header */}
    <div style={{ position: 'relative', textAlign: 'center', marginBottom: 48 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--purple-700)', textTransform: 'uppercase', marginBottom: 10 }}>Shipped</div>
      <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: -2, fontWeight: 800, color: 'var(--ink-900)', margin: 0 }}>
        Timeline
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 14, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
        Newest first. Every entry is a real release running in production today.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', marginTop: 18 }}>
        {['All', 'Releases', 'Milestones'].map((t, i) => (
          <span key={t} style={{ padding: '5px 13px', fontSize: 12, fontWeight: 600, borderRadius: 99, background: i === 0 ? 'var(--ink-900)' : 'var(--card)', color: i === 0 ? '#fff' : 'var(--ink-700)', border: '1px solid', borderColor: i === 0 ? 'var(--ink-900)' : 'var(--ink-200)', cursor: 'pointer' }}>{t}</span>
        ))}
      </div>
    </div>

    {/* Alternating timeline */}
    <div style={{ position: 'relative', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Solid center rail */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: 8, bottom: 8,
        width: 2, transform: 'translateX(-50%)',
        background: 'linear-gradient(180deg, var(--purple-700) 0%, var(--ink-200) 100%)',
        borderRadius: 99,
      }} />

      {shipped.map((s, i) => {
        const cardOnLeft = i % 2 === 0;
        return (
          <div key={i} style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 40px 1fr',
            alignItems: 'center',
            marginBottom: i < shipped.length - 1 ? 32 : 0,
          }}>
            {/* LEFT slot */}
            <div style={{ paddingRight: 28, display: 'flex', justifyContent: 'flex-end' }}>
              {cardOnLeft ? <ShippedTitleCard s={s} side="left" /> : <ShippedDatePill s={s} />}
            </div>

            {/* Center dot */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 99,
                background: 'var(--card)',
                border: `3px solid var(--purple-700)`,
                boxShadow: s.latest ? `0 0 0 6px var(--purple-50), 0 2px 8px -2px rgba(91,77,200,.4)` : '0 0 0 4px var(--paper)',
              }} />
            </div>

            {/* RIGHT slot */}
            <div style={{ paddingLeft: 28, display: 'flex', justifyContent: 'flex-start' }}>
              {cardOnLeft ? <ShippedDatePill s={s} /> : <ShippedTitleCard s={s} side="right" />}
            </div>
          </div>
        );
      })}
    </div>

    <div style={{ textAlign: 'center', marginTop: 48 }}>
      <button style={{ ...ghostBtn, padding: '10px 22px', fontSize: 13, border: '1px solid var(--ink-200)' }}>
        Load older milestones <Icon name="chevron-down" size={13} />
      </button>
    </div>
  </section>
);

const ShippedTitleCard = ({ s, side }) => (
  <article style={{
    maxWidth: 440, width: '100%',
    background: 'transparent',
    textAlign: side === 'left' ? 'right' : 'left',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: side === 'left' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      {s.latest && (
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple-700)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--purple-700)' }} />
          Latest
        </span>
      )}
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'var(--paper)', color: 'var(--ink-500)', letterSpacing: 0.4, textTransform: 'uppercase', border: '1px solid var(--ink-100)' }}>
        {s.kind === 'release' ? 'Release' : 'Milestone'}
      </span>
    </div>
    <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)', margin: '0 0 10px', lineHeight: 1.2 }}>{s.title}</h3>
    <p style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
    {s.metric && (
      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '5px 11px', background: 'var(--purple-50)', borderRadius: 99 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple-700)', letterSpacing: -0.3 }}>{s.metric}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-700)', fontWeight: 500 }}>{s.metricLabel}</span>
      </div>
    )}
  </article>
);

const ShippedDatePill = ({ s }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: s.latest ? 'var(--purple-700)' : 'var(--purple-600)',
    color: '#fff',
    borderRadius: 99,
    fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
    boxShadow: '0 6px 16px -8px rgba(91,77,200,.45), 0 2px 4px -1px rgba(91,77,200,.2)',
  }}>
    {s.date}
  </div>
);

// ─── By the Numbers ──────────────────────────────────────────
const ByTheNumbersSection = () => {
  const PoroMark = window.PoroMark;
  return (
  <section style={{ padding: '60px 64px', background: 'linear-gradient(135deg, var(--ink-900) 0%, #2f2840 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.04) 1px, transparent 0)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
    {/* Watermark — oversized Poro mark, faint white */}
    {PoroMark && (
      <div aria-hidden="true" style={{ position: 'absolute', right: -100, top: -120, opacity: 0.08, transform: 'rotate(-8deg)', pointerEvents: 'none' }}>
        <PoroMark size={520} color="#fff" />
      </div>
    )}
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--purple-500)', textTransform: 'uppercase', marginBottom: 8 }}>By the numbers</div>
      <h2 style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: -0.8, fontWeight: 700, margin: '0 0 28px', maxWidth: 640 }}>
        IT, by the year so far.
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          ['2,143', 'Tickets resolved', '94% within SLA'],
          ['99.94%', 'Uptime · last 90d', 'No major incidents'],
          ['13', 'Apps integrated', 'Single sign-on'],
          ['38', 'Projects shipped', '+6 vs. last year'],
        ].map(([v, l, s], i) => (
          <div key={i}>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.4, color: '#fff', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)', marginTop: 8 }}>{l}</div>
            <div style={{ fontSize: 11.5, color: 'var(--purple-500)', marginTop: 3 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

// ─── Apps ────────────────────────────────────────────────────
const apps = [
  ['E', 'var(--ink-900)', 'var(--card)', 'ERPNext', 'Finance, HR, inventory'],
  ['N', '#fff', '#0082c9', 'Nextcloud', 'Files & collaboration'],
  ['S', '#fff', 'var(--orange-600)', 'Synx FMS', 'Facility maintenance'],
  ['S', '#fff', 'var(--blue-600)', 'Synx Sched', 'Crew scheduling'],
  ['C', '#fff', 'var(--purple-700)', 'Porti', 'IT service portal'],
  ['S', '#fff', 'var(--violet-600)', 'Steward', 'Asset & inventory'],
  ['M', '#fff', 'var(--amber-600)', 'Mailcow', 'Email & groupware'],
  ['R', '#fff', '#5865F2', 'Rocket.Chat', 'Internal messaging'],
  ['J', '#fff', '#2684FF', 'Jitsi', 'Video conferencing'],
  ['G', '#fff', 'var(--ink-900)', 'Gitea', 'Source control'],
  ['W', '#fff', '#1568b3', 'Wiki', 'Internal knowledge base'],
  ['B', '#fff', 'var(--rose-600)', 'BookStack', 'Documentation'],
];

const AppsSection = () => {
  return (
  <section id="services" style={{ padding: '56px 0 64px', background: 'var(--paper)', borderTop: '1px solid var(--ink-100)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
    <div style={{ padding: '0 64px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 8 }}>Apps &amp; services</div>
        <h2 style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: -0.8, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>Everything COMFAC runs on.</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-500)', marginTop: 6 }}>One sign-in opens all {apps.length} of them.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a style={{ fontSize: 13, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
          See all <Icon name="arrow-right" size={13} />
        </a>
        <button style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--card)', border: '1px solid var(--ink-200)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
          <Icon name="arrow-left" size={14} color="var(--ink-700)" />
        </button>
        <button style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--ink-900)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
          <Icon name="arrow-right" size={14} color="#fff" />
        </button>
      </div>
    </div>

    {/* Horizontal strip — snap scroll, peek of next card visible */}
    <div style={{ position: 'relative' }}>
      {/* Fade edges */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 64, background: 'linear-gradient(90deg, var(--paper) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 64, background: 'linear-gradient(270deg, var(--paper) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{
        display: 'flex', gap: 14,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        padding: '4px 64px 14px',
        scrollbarWidth: 'none',
      }}>
        {apps.map(([letter, fg, bg, label, desc], i) => (
          <article key={i} style={{
            flex: '0 0 220px',
            scrollSnapAlign: 'start',
            background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14,
            padding: 18, display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
          }}>
            <ServiceGlyph letter={letter} color={fg} bg={bg} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
            </div>
          </article>
        ))}
      </div>

      {/* Page dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 99, background: i === 0 ? 'var(--purple-700)' : 'var(--ink-200)', transition: 'all .2s' }} />
        ))}
      </div>
    </div>
    </div>
  </section>
  );
};

// ─── Footer ──────────────────────────────────────────────────
const LandingFooter = () => {
  const PoroMark = window.PoroMark;
  return (
    <footer style={{ padding: '56px 64px 32px', background: 'var(--card)', borderTop: '1px solid var(--ink-100)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            {PoroMark && <PoroMark size={22} color="var(--purple-700)" />}
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: -0.6, color: 'var(--ink-900)' }}>
              Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.6, maxWidth: 320, margin: 0 }}>
            The internal IT service portal for COMFAC. Built and maintained by the IT team.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '6px 12px', background: 'var(--green-50)', color: 'var(--green-600)', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--green-600)' }} /> All systems operational
          </div>
        </div>
        {[
          ['Portal', ['Workshop', 'Shipped', 'Services', 'Status']],
          ['Get help', ['Help center', 'Submit ticket', 'Contact IT', 'Knowledge base']],
          ['About', ['IT team', 'Roadmap', 'Privacy', 'Terms']],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 12 }}>{h}</div>
            {items.map(it => (
              <div key={it} style={{ fontSize: 13, color: 'var(--ink-700)', marginBottom: 8, cursor: 'pointer' }}>{it}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 24, borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--ink-500)' }}>
        <span>© 2026 COMFAC IT · Built with care in Manila</span>
        <span>v2.4.0 · last deployed 2 days ago</span>
      </div>
    </footer>
  );
};

const navLink = { color: 'var(--ink-700)', textDecoration: 'none', cursor: 'pointer', fontWeight: 500 };
const ghostBtn = { background: 'transparent', border: 'none', color: 'var(--ink-700)', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' };
const primaryBtn = { background: 'var(--ink-900)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' };
const eyebrow = { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green-50)', color: 'var(--green-600)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 };
const progStep = (done) => ({ flex: 1, height: 4, borderRadius: 99, background: done ? 'var(--ink-900)' : 'var(--ink-100)' });

window.LandingFrame = LandingFrame;
