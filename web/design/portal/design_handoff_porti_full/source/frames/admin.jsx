// Admin Dashboard + Services — redesigned in Porti theme
// Shared: dark sidebar, matte paper canvas, lavender accents, no AI-slop colored stripes.

const AdminShell = ({ active = 'dashboard', children, height = 920 }) => {
  const PoroMark = window.PoroMark;
  const items = [
    ['dashboard', 'home', 'Dashboard'],
    ['services', 'grid', 'Services'],
    ['requests', 'inbox', 'Requests', '4'],
    ['my', 'file', 'My Requests'],
    ['kb', 'book', 'Knowledge Base'],
    ['board', 'message-circle', 'Community Board'],
  ];
  const groups = [
    ['people', 'users', 'People'],
    ['insights', 'bar-chart', 'Insights'],
    ['settings', 'settings', 'Settings'],
    ['inventory', 'box', 'Inventory'],
  ];
  return (
    <BrowserChrome url="porti.comfac-it.com/admin" height={height}>
      <div className="frame" style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--paper)' }}>
        {/* Sidebar */}
        <aside style={{ width: 240, background: '#1a1622', color: '#cfc7da', display: 'flex', flexDirection: 'column', flex: '0 0 auto' }}>
          <div style={{ padding: '20px 18px 22px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <PoroMark size={22} color="var(--purple-500)" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: '#fff' }}>
              Porti<span style={{ color: 'var(--purple-500)' }}>.</span>
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 9.5, padding: '2.5px 7px', background: 'rgba(123,111,220,.15)', color: 'var(--purple-500)', borderRadius: 99, fontWeight: 700, letterSpacing: 0.5 }}>ADMIN</span>
          </div>
          <nav style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map(([id, icon, label, badge]) => {
              const a = active === id;
              return (
                <a key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 8,
                  background: a ? 'rgba(123,111,220,.18)' : 'transparent',
                  color: a ? '#fff' : '#a39bb0', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer',
                  position: 'relative',
                }}>
                  {a && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: 'var(--purple-500)', borderRadius: 99 }} />}
                  <Icon name={icon} size={15} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && <span style={{ fontSize: 10, padding: '2px 7px', background: 'var(--purple-700)', color: '#fff', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
                </a>
              );
            })}
            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '12px 8px' }} />
            {groups.map(([id, icon, label]) => (
              <a key={id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 8, color: '#a39bb0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Icon name={icon} size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                <Icon name="chevron-right" size={12} />
              </a>
            ))}
          </nav>
          <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>TC</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Topepe Cruz</div>
                <div style={{ fontSize: 10.5, color: '#a39bb0' }}>IT Administrator</div>
              </div>
              <Icon name="more-horizontal" size={14} color="#a39bb0" />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ height: 58, padding: '0 28px', borderBottom: '1px solid var(--ink-100)', background: 'var(--card)', display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
            <div style={{ flex: 1, maxWidth: 460, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '8px 12px' }}>
              <Icon name="search" size={14} color="var(--ink-500)" />
              <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="Search tickets, requests, people…" />
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', padding: '2px 6px', border: '1px solid var(--ink-200)', borderRadius: 4 }}>⌘K</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button style={tBtn}><Icon name="message-circle" size={15} color="var(--ink-700)" /></button>
              <button style={{ ...tBtn, position: 'relative' }}>
                <Icon name="bell" size={15} color="var(--ink-700)" />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 99, background: 'var(--rose-600)', border: '2px solid var(--card)' }} />
              </button>
              <button style={{ ...primaryAdmin, marginLeft: 6 }}>
                <Icon name="plus" size={13} /> New request
              </button>
            </div>
          </header>
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 32px' }}>
            {children}
          </div>
        </main>
      </div>
    </BrowserChrome>
  );
};

const tBtn = { background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const primaryAdmin = { background: 'var(--ink-900)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 };

// ─── Dashboard ──────────────────────────
const AdminDashboardFrame = () => (
  <AdminShell active="dashboard" height={1100}>
    {/* Greeting */}
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink-900)' }}>Good morning, Topepe</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Friday, May 8 · 2 unassigned and 1 ticket past SLA need a look.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'inline-flex', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: 3 }}>
          {['7d', '30d', '90d'].map((p, i) => (
            <span key={p} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              background: i === 1 ? 'var(--purple-700)' : 'transparent',
              color: i === 1 ? '#fff' : 'var(--ink-700)',
            }}>{p}</span>
          ))}
        </div>
        <button style={{ ...tBtn, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', display: 'inline-flex', gap: 6 }}>
          <Icon name="download" size={13} /> Export
        </button>
      </div>
    </div>

    {/* Action strip — what needs YOUR attention */}
    <div style={{ background: 'linear-gradient(135deg, var(--ink-900) 0%, #2f2840 100%)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert-triangle" size={16} color="var(--purple-500)" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Needs your attention</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>3 items waiting on you</div>
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          ['2', 'Unassigned tickets', 'amber'],
          ['1', 'Past SLA', 'rose'],
          ['4', 'Awaiting your approval', 'purple'],
        ].map(([n, l, tone]) => (
          <div key={l} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: tone === 'rose' ? '#ff8da3' : tone === 'amber' ? '#ffc97a' : 'var(--purple-500)' }}>{n}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', flex: 1 }}>{l}</span>
            <Icon name="arrow-right" size={13} color="rgba(255,255,255,.55)" />
          </div>
        ))}
      </div>
    </div>

    {/* KPI strip — single row, tighter */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
      {[
        ['Total', '228', '+12', 'up'],
        ['Pending', '2', '−1', 'down'],
        ['In progress', '4', '+2', 'up'],
        ['Resolved', '193', '+18', 'up'],
        ['Active staff', '19', '0', 'flat'],
        ['Active interns', '25', '+3', 'up'],
      ].map(([l, v, d, dir]) => (
        <div key={l} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{l}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.5 }}>{v}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: dir === 'up' ? 'var(--green-600)' : dir === 'down' ? 'var(--rose-600)' : 'var(--ink-500)' }}>
              {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} {d}
            </span>
          </div>
        </div>
      ))}
    </div>

    {/* 2-column main */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
      {/* Stacked trend */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Request volume</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Last 30 days · stacked by status</div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-700)' }}>
            {[['Resolved', 'var(--green-600)'], ['In progress', 'var(--purple-700)'], ['Pending', 'var(--amber-600)']].map(([n, c]) => (
              <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /> {n}
              </span>
            ))}
          </div>
        </div>
        {/* Bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 220, marginTop: 18, paddingBottom: 24, borderBottom: '1px solid var(--ink-100)', position: 'relative' }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const r = 20 + Math.sin(i * .5) * 8 + (i % 4) * 4;
            const p = 4 + Math.cos(i * .7) * 3;
            const ip = 6 + Math.sin(i * .3) * 4;
            const isToday = i === 29;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
                <div style={{ height: r, background: isToday ? 'var(--green-600)' : 'var(--green-600)', opacity: isToday ? 1 : .85, borderRadius: '3px 3px 0 0' }} />
                <div style={{ height: ip, background: 'var(--purple-700)', opacity: isToday ? 1 : .85 }} />
                <div style={{ height: p, background: 'var(--amber-600)', opacity: isToday ? 1 : .85, borderRadius: '0 0 3px 3px' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-500)' }}>
          <span>Apr 9</span><span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 8</span>
        </div>
      </div>

      {/* By type donut */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>By type</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, marginBottom: 16 }}>228 total requests</div>
        {/* Simple stacked horizontal bars (cleaner than overlapping donuts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Support Ticket', 184, 'var(--purple-700)'],
            ['Service Request', 22, 'var(--blue-600)'],
            ['Asset Request', 14, 'var(--orange-600)'],
            ['Change Request', 8, 'var(--green-600)'],
          ].map(([n, v, c]) => (
            <div key={n}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink-700)', fontWeight: 500 }}>{n}</span>
                <span style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{v} <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>· {Math.round(v / 228 * 100)}%</span></span>
              </div>
              <div style={{ height: 8, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${v / 228 * 100}%`, height: '100%', background: c, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent activity */}
    <div style={{ marginTop: 14, background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Recent activity</div>
        <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          ['SR-2104', 'New laptop request from Mark Reyes', 'submit', 'purple', '2 min ago'],
          ['CR-1042', 'Approved — DNS change deployed by Jay Lim', 'check', 'green', '24 min ago'],
          ['ST-9817', 'VPN issue resolved · Joan Cabral', 'check', 'green', '1 hr ago'],
          ['AR-0312', 'Unassigned · monitor for 3F-Ops', 'alert-triangle', 'amber', '2 hrs ago'],
          ['ST-9812', 'Past SLA · Outlook crash on shared mailbox', 'clock', 'rose', '3 hrs ago'],
        ].map(([id, t, ic, tone, time], i, a) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 99, flex: '0 0 auto',
              background: tone === 'green' ? 'var(--green-50)' : tone === 'amber' ? 'var(--amber-50)' : tone === 'rose' ? 'var(--rose-50)' : 'var(--purple-50)',
              color: tone === 'green' ? 'var(--green-600)' : tone === 'amber' ? 'var(--amber-600)' : tone === 'rose' ? 'var(--rose-600)' : 'var(--purple-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={ic} size={13} />
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', minWidth: 70 }}>{id}</span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-900)' }}>{t}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  </AdminShell>
);

// ─── Services (request center) ──────────
const AdminServicesFrame = () => (
  <AdminShell active="services" height={1100}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink-900)' }}>Submit a request</div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Pick the right type below — the form adapts to what you need.</div>
    </div>

    {/* Most-used row (smart shortcut) */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Most used</div>
      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
        {[['VPN access', 'shield'], ['Password reset', 'key'], ['New laptop', 'monitor'], ['Email alias', 'mail']].map(([n, ic]) => (
          <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99, fontSize: 12, color: 'var(--ink-700)', fontWeight: 500, cursor: 'pointer' }}>
            <Icon name={ic} size={12} color="var(--purple-700)" /> {n}
          </span>
        ))}
      </div>
    </div>

    {/* 4 request types — Porti themed, no rainbow stripes */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 26 }}>
      {[
        { ic: 'refresh-cw', t: 'Change Request', d: 'Configuration, firewall, DNS, or system changes', sla: '3–5 working days', avg: '~ 2 days' },
        { ic: 'life-buoy', t: 'Support Ticket', d: 'Something is broken or not working as expected', sla: '< 4 hours', avg: '~ 1 day', popular: true },
        { ic: 'box', t: 'Service Request', d: 'New software, access, accounts, or onboarding', sla: '1–3 working days', avg: '~ 1 day' },
        { ic: 'monitor', t: 'Asset Request', d: 'Hardware, peripherals, or software licenses', sla: '5–10 working days', avg: '~ 4 days' },
      ].map(c => (
        <div key={c.t} style={{ background: 'var(--card)', border: '1px solid', borderColor: c.popular ? 'var(--purple-700)' : 'var(--ink-100)', borderRadius: 14, padding: 18, position: 'relative', cursor: 'pointer', boxShadow: c.popular ? '0 0 0 3px var(--purple-100), 0 12px 24px -16px rgba(91,77,200,.4)' : 'none' }}>
          {c.popular && <span style={{ position: 'absolute', top: -9, right: 14, background: 'var(--purple-700)', color: '#fff', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: '3px 9px', borderRadius: 99 }}>MOST USED</span>}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name={c.ic} size={17} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{c.t}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4, lineHeight: 1.5, minHeight: 36 }}>{c.d}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ink-100)', fontSize: 10.5, color: 'var(--ink-500)' }}>
            <span><b style={{ color: 'var(--ink-900)' }}>SLA</b> {c.sla}</span>
            <span><b style={{ color: 'var(--ink-900)' }}>Avg</b> {c.avg}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: c.popular ? 'var(--purple-700)' : 'var(--ink-700)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Submit request <Icon name="arrow-right" size={12} />
          </div>
        </div>
      ))}
    </div>

    {/* Two-col: Your recent + Open an app */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 14 }}>
      {/* Your recent requests */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Your recent requests</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Reuse one as a template, or check status.</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
        </div>
        {[
          ['ST-9812', 'Outlook crash on shared mailbox', 'In progress', 'purple'],
          ['SR-2098', 'GitLab access for new repo', 'Resolved', 'green'],
          ['AR-0301', 'Replacement keyboard', 'Pending', 'amber'],
        ].map(([id, t, s, tone], i, a) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', minWidth: 64 }}>{id}</span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-900)' }}>{t}</span>
            <Pill tone={tone === 'green' ? 'green' : tone === 'amber' ? 'amber' : 'purple'}>{s}</Pill>
            <Icon name="copy" size={13} color="var(--ink-500)" style={{ cursor: 'pointer' }} />
          </div>
        ))}
      </div>

      {/* Open an app */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Open an app</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Single sign-on. No extra password.</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>All apps →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            ['E', 'var(--ink-900)', 'var(--card)', 'ERPNext'],
            ['N', '#fff', '#0082c9', 'Nextcloud'],
            ['S', '#fff', 'var(--orange-600)', 'Synx FMS'],
            ['S', '#fff', 'var(--blue-600)', 'Synx Sched'],
            ['S', '#fff', 'var(--violet-600)', 'Steward'],
            ['M', '#fff', 'var(--amber-600)', 'Mailcow'],
            ['I', '#fff', 'var(--purple-700)', 'Internship'],
            ['+', 'var(--ink-500)', 'var(--paper)', '5 more'],
          ].map(([l, fg, bg, n], i) => (
            <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <ServiceGlyph letter={l} color={fg} bg={bg} />
              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-700)', textAlign: 'center' }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminShell>
);

window.AdminDashboardFrame = AdminDashboardFrame;
window.AdminServicesFrame = AdminServicesFrame;
