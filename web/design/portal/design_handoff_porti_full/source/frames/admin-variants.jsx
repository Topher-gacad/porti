// Admin variants — softer sidebars that match the Porti paper/ink palette.

// ── Variant A: Paper sidebar (light cream rail, purple active pill) ──
const AdminShellPaper = ({ active = 'dashboard', children, height = 1100 }) => {
  const PoroMark = window.PoroMark;
  const items = [
    ['dashboard', 'home', 'Dashboard'],
    ['services', 'grid', 'Services'],
    ['requests', 'inbox', 'Requests', '4'],
    ['kb', 'book', 'Knowledge Base'],
    ['board', 'message-circle', 'Community'],
  ];
  return (
    <BrowserChrome url="porti.comfac-it.com/admin" height={height}>
      <div className="frame" style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--paper)' }}>
        <aside style={{ width: 232, background: 'var(--card)', color: 'var(--ink-700)', display: 'flex', flexDirection: 'column', flex: '0 0 auto', borderRight: '1px solid var(--ink-100)' }}>
          <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid var(--ink-100)' }}>
            <PoroMark size={22} color="var(--purple-700)" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: 'var(--ink-900)' }}>
              Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 9.5, padding: '2.5px 7px', background: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: 99, fontWeight: 700, letterSpacing: 0.5 }}>ADMIN</span>
          </div>
          <nav style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-500)', textTransform: 'uppercase', padding: '8px 12px 4px' }}>Workspace</div>
            {items.map(([id, icon, label, badge]) => {
              const a = active === id;
              return (
                <a key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '8px 12px', borderRadius: 8,
                  background: a ? 'var(--purple-50)' : 'transparent',
                  color: a ? 'var(--purple-700)' : 'var(--ink-700)',
                  fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer',
                }}>
                  <Icon name={icon} size={15} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && <span style={{ fontSize: 10, padding: '2px 7px', background: a ? 'var(--purple-700)' : 'var(--ink-200)', color: a ? '#fff' : 'var(--ink-700)', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
                </a>
              );
            })}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-500)', textTransform: 'uppercase', padding: '14px 12px 4px' }}>Manage</div>
            {[['people', 'users', 'People'], ['insights', 'bar-chart', 'Insights'], ['inventory', 'box', 'Inventory'], ['settings', 'settings', 'Settings']].map(([id, ic, l]) => (
              <a key={id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 12px', borderRadius: 8, color: 'var(--ink-700)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Icon name={ic} size={15} />
                <span style={{ flex: 1 }}>{l}</span>
              </a>
            ))}
          </nav>
          <div style={{ padding: 12, borderTop: '1px solid var(--ink-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>TC</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>Topepe Cruz</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>IT Administrator</div>
              </div>
              <Icon name="more-horizontal" size={14} color="var(--ink-500)" />
            </div>
          </div>
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
              <button style={{ ...primaryAdmin, marginLeft: 6 }}><Icon name="plus" size={13} /> New request</button>
            </div>
          </header>
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 32px' }}>{children}</div>
        </main>
      </div>
    </BrowserChrome>
  );
};

// ── Variant B: Top nav (no sidebar — horizontal tabs) ──
const AdminShellTop = ({ active = 'dashboard', children, height = 1100 }) => {
  const PoroMark = window.PoroMark;
  const tabs = [
    ['dashboard', 'home', 'Dashboard'],
    ['services', 'grid', 'Services'],
    ['requests', 'inbox', 'Requests', '4'],
    ['kb', 'book', 'Knowledge Base'],
    ['board', 'message-circle', 'Community'],
    ['people', 'users', 'People'],
    ['insights', 'bar-chart', 'Insights'],
  ];
  return (
    <BrowserChrome url="porti.comfac-it.com/admin" height={height}>
      <div className="frame" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
        {/* Brand row */}
        <div style={{ height: 56, padding: '0 28px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <PoroMark size={24} color="var(--purple-700)" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: -0.5, color: 'var(--ink-900)' }}>
            Porti<span style={{ color: 'var(--purple-700)' }}>.</span>
          </span>
          <span style={{ fontSize: 10, padding: '3px 8px', background: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: 99, fontWeight: 700, letterSpacing: 0.5 }}>ADMIN</span>
          <div style={{ flex: 1, maxWidth: 380, marginLeft: 24, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '7px 12px' }}>
            <Icon name="search" size={14} color="var(--ink-500)" />
            <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="Search…" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', padding: '2px 6px', border: '1px solid var(--ink-200)', borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={tBtn}><Icon name="message-circle" size={15} color="var(--ink-700)" /></button>
            <button style={{ ...tBtn, position: 'relative' }}>
              <Icon name="bell" size={15} color="var(--ink-700)" />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 99, background: 'var(--rose-600)', border: '2px solid var(--card)' }} />
            </button>
            <button style={{ ...primaryAdmin, marginLeft: 6 }}><Icon name="plus" size={13} /> New request</button>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: 8 }}>TC</div>
          </div>
        </div>
        {/* Tab row */}
        <div style={{ height: 44, padding: '0 28px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 2 }}>
          {tabs.map(([id, ic, l, badge]) => {
            const a = active === id;
            return (
              <a key={id} style={{
                position: 'relative', height: '100%', display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '0 14px', fontSize: 12.5, fontWeight: a ? 600 : 500,
                color: a ? 'var(--ink-900)' : 'var(--ink-500)', cursor: 'pointer',
              }}>
                <Icon name={ic} size={13} />
                {l}
                {badge && <span style={{ fontSize: 9.5, padding: '1.5px 6px', background: 'var(--purple-700)', color: '#fff', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
                {a && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, background: 'var(--purple-700)', borderRadius: 99 }} />}
              </a>
            );
          })}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 32px' }}>{children}</div>
      </div>
    </BrowserChrome>
  );
};

// ── Dashboard B (Variant A shell + reframed content) ──
// Reframes: lead with "Operations pulse" hero, smarter content blocks
const AdminDashboardPaperFrame = () => (
  <AdminShellPaper active="dashboard">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--purple-700)', textTransform: 'uppercase' }}>Friday · May 8</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)', marginTop: 4 }}>Operations pulse</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Everything queued, in flight, or awaiting your call.</div>
      </div>
      <div style={{ display: 'inline-flex', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: 3 }}>
        {['Today', '7d', '30d', '90d'].map((p, i) => (
          <span key={p} style={{
            padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            background: i === 2 ? 'var(--ink-900)' : 'transparent',
            color: i === 2 ? '#fff' : 'var(--ink-700)',
          }}>{p}</span>
        ))}
      </div>
    </div>

    {/* Pulse row — narrative cards instead of just numbers */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
      {[
        { ic: 'alert-triangle', tone: 'rose', title: '1 ticket past SLA', body: 'ST-9812 · Outlook crash · 4h overdue', cta: 'Reassign' },
        { ic: 'inbox', tone: 'amber', title: '2 unassigned', body: 'Queued for 38 min · longest 1h 12min', cta: 'Triage queue' },
        { ic: 'check-circle', tone: 'green', title: '4 awaiting approval', body: '3 access requests · 1 change request', cta: 'Review' },
      ].map(c => (
        <div key={c.title} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 18, bottom: 18, width: 3, background: c.tone === 'rose' ? 'var(--rose-600)' : c.tone === 'amber' ? 'var(--amber-600)' : 'var(--green-600)', borderRadius: 99 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: c.tone === 'rose' ? 'var(--rose-50)' : c.tone === 'amber' ? 'var(--amber-50)' : 'var(--green-50)',
              color: c.tone === 'rose' ? 'var(--rose-600)' : c.tone === 'amber' ? 'var(--amber-600)' : 'var(--green-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={c.ic} size={14} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>{c.title}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>{c.body}</div>
          <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{c.cta} <Icon name="arrow-right" size={11} /></span>
        </div>
      ))}
    </div>

    {/* KPI strip — lighter visuals */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: '4px 0', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {[
        ['Total', '228', '+12'],
        ['Pending', '2', '−1'],
        ['In progress', '4', '+2'],
        ['Resolved', '193', '+18'],
        ['Active staff', '19', '0'],
        ['Active interns', '25', '+3'],
      ].map(([l, v, d], i) => (
        <div key={l} style={{ padding: '14px 18px', borderRight: i < 5 ? '1px solid var(--ink-100)' : 'none' }}>
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{l}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.5 }}>{v}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: d.startsWith('+') ? 'var(--green-600)' : d.startsWith('−') ? 'var(--rose-600)' : 'var(--ink-500)' }}>{d}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Trend + by-type */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 16 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Request volume</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>30 days · stacked by status</div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-700)' }}>
            {[['Resolved', 'var(--green-600)'], ['In progress', 'var(--purple-700)'], ['Pending', 'var(--amber-600)']].map(([n, c]) => (
              <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /> {n}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200, paddingBottom: 22, borderBottom: '1px solid var(--ink-100)' }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const r = 18 + Math.sin(i * .5) * 8 + (i % 4) * 4;
            const p = 4 + Math.cos(i * .7) * 3;
            const ip = 6 + Math.sin(i * .3) * 4;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
                <div style={{ height: r, background: 'var(--green-600)', opacity: .85, borderRadius: '3px 3px 0 0' }} />
                <div style={{ height: ip, background: 'var(--purple-700)', opacity: .85 }} />
                <div style={{ height: p, background: 'var(--amber-600)', opacity: .85, borderRadius: '0 0 3px 3px' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-500)' }}>
          <span>Apr 9</span><span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 8</span>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 22 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>By type</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, marginBottom: 18 }}>228 total this month</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

    {/* Two-col: Activity + Top performers */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Recent activity</div>
          <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
        </div>
        {[
          ['SR-2104', 'New laptop request from Mark Reyes', 'submit', 'purple', '2 min ago'],
          ['CR-1042', 'Approved — DNS change deployed by Jay Lim', 'check', 'green', '24 min ago'],
          ['ST-9817', 'VPN issue resolved · Joan Cabral', 'check', 'green', '1 hr ago'],
          ['AR-0312', 'Unassigned · monitor for 3F-Ops', 'alert-triangle', 'amber', '2 hrs ago'],
        ].map(([id, t, ic, tone, time], i, a) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 99, flex: '0 0 auto',
              background: tone === 'green' ? 'var(--green-50)' : tone === 'amber' ? 'var(--amber-50)' : 'var(--purple-50)',
              color: tone === 'green' ? 'var(--green-600)' : tone === 'amber' ? 'var(--amber-600)' : 'var(--purple-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={ic} size={12} />
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', minWidth: 64 }}>{id}</span>
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-900)' }}>{t}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{time}</span>
          </div>
        ))}
      </div>

      {/* Top resolvers — new content idea */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Top resolvers · this week</div>
          <Icon name="award" size={14} color="var(--ink-500)" />
        </div>
        {[
          ['Jay Lim', 'IT Support', 38, '2.1h'],
          ['Joan Cabral', 'IT Support', 31, '2.8h'],
          ['Aldo Reyes', 'Sysadmin', 22, '3.4h'],
          ['Mira Soto', 'Intern', 14, '4.2h'],
        ].map(([n, r, c, avg], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--ink-100)' : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', minWidth: 16 }}>#{i + 1}</span>
            <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700 }}>{n.split(' ').map(x => x[0]).join('')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{r}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{c}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-500)' }}>avg {avg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminShellPaper>
);

// ── Dashboard C: Top-nav variant — content reframed as a "command center" with focus on queues ──
const AdminDashboardTopFrame = () => (
  <AdminShellTop active="dashboard">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Live snapshot · last updated 12s ago</div>
      </div>
    </div>

    {/* Single-row mega cards: queue + SLA + workload */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
      {/* Queue depth gauge */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Open queue</span>
          <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>● healthy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>6</span>
          <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>open tickets</span>
        </div>
        <div style={{ height: 8, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '34%', background: 'var(--amber-600)' }} />
          <div style={{ width: '66%', background: 'var(--purple-700)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--ink-500)' }}>
          <span>2 pending</span><span>4 in progress</span>
        </div>
      </div>

      {/* SLA health */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>SLA compliance</span>
          <span style={{ fontSize: 11, color: 'var(--amber-600)', fontWeight: 600 }}>● watch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>96.4%</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose-600)' }}>↓ 1.2pt</span>
        </div>
        <div style={{ display: 'flex', gap: 4, height: 28, alignItems: 'flex-end' }}>
          {[88, 92, 96, 99, 97, 98, 96.4].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v - 80}%`, background: i === 6 ? 'var(--purple-700)' : 'var(--ink-200)', borderRadius: 2, minHeight: 2 }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 6 }}>1 of 28 tickets past SLA · last 7d</div>
      </div>

      {/* Avg resolution */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Avg resolution</span>
          <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>● fast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -1.2 }}>2.7h</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)' }}>↓ 18m</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Support Ticket</span><span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>1.4h</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Service Request</span><span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>1d 2h</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Asset Request</span><span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>3d 18h</span></div>
        </div>
      </div>
    </div>

    {/* My queue table — actionable view, replaces the donut */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, marginBottom: 14 }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>My queue</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>6 tickets · sorted by SLA risk</div>
        </div>
        <div style={{ display: 'inline-flex', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, padding: 2 }}>
          {['All', 'Mine', 'Unassigned'].map((p, i) => (
            <span key={p} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: i === 1 ? 'var(--card)' : 'transparent', color: i === 1 ? 'var(--ink-900)' : 'var(--ink-500)', boxShadow: i === 1 ? '0 1px 2px rgba(0,0,0,.04)' : 'none' }}>{p}</span>
          ))}
        </div>
      </div>
      <div>
        {[
          ['ST-9812', 'Outlook crash on shared mailbox', 'ST', 'rose', 'PAST SLA · 4h', 'Joan Cabral'],
          ['SR-2104', 'New laptop request from Mark Reyes', 'SR', 'amber', 'Due 2h', 'Unassigned'],
          ['ST-9818', 'Slack notifications not working · iOS', 'ST', 'purple', 'Due 1d', 'Jay Lim'],
          ['AR-0312', 'Monitor for 3F-Ops', 'AR', 'amber', 'Due 4d', 'Unassigned'],
          ['CR-1043', 'Firewall rule for build server', 'CR', 'purple', 'Due 5d', 'Aldo Reyes'],
        ].map(([id, t, badge, tone, due, owner], i, a) => (
          <div key={id} style={{ display: 'grid', gridTemplateColumns: '64px 24px 1fr 130px 130px 16px', gap: 14, alignItems: 'center', padding: '13px 22px', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none', cursor: 'pointer' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{id}</span>
            <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 5px', background: 'var(--ink-900)', color: '#fff', borderRadius: 4, textAlign: 'center', letterSpacing: 0.5 }}>{badge}</span>
            <span style={{ fontSize: 13, color: 'var(--ink-900)' }}>{t}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: tone === 'rose' ? 'var(--rose-600)' : tone === 'amber' ? 'var(--amber-600)' : 'var(--purple-700)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} /> {due}
            </span>
            <span style={{ fontSize: 12, color: owner === 'Unassigned' ? 'var(--ink-500)' : 'var(--ink-700)', fontStyle: owner === 'Unassigned' ? 'italic' : 'normal' }}>{owner}</span>
            <Icon name="chevron-right" size={13} color="var(--ink-500)" />
          </div>
        ))}
      </div>
    </div>

    {/* Bottom: trend + by-type — same as B but compact */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Volume · 30 days</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Stacked by status</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingBottom: 18, borderBottom: '1px solid var(--ink-100)' }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const r = 14 + Math.sin(i * .5) * 6 + (i % 4) * 3;
            const p = 3 + Math.cos(i * .7) * 2;
            const ip = 5 + Math.sin(i * .3) * 3;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
                <div style={{ height: r, background: 'var(--green-600)', opacity: .85, borderRadius: '3px 3px 0 0' }} />
                <div style={{ height: ip, background: 'var(--purple-700)', opacity: .85 }} />
                <div style={{ height: p, background: 'var(--amber-600)', opacity: .85, borderRadius: '0 0 3px 3px' }} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>By type</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, marginBottom: 16 }}>228 total</div>
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
                <span style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{v}</span>
              </div>
              <div style={{ height: 6, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${v / 228 * 100}%`, height: '100%', background: c, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminShellTop>
);

// ── Services Variant — paper sidebar shell, content is a "request builder" wizard feel ──
const AdminServicesPaperFrame = () => (
  <AdminShellPaper active="services">
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>Services</div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Pick a request type, browse the catalog, or jump into an app.</div>
    </div>

    {/* Tab switcher: Request types vs Apps catalog */}
    <div style={{ display: 'inline-flex', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
      {[['New request', true], ['Service catalog', false], ['App launcher', false]].map(([l, a], i) => (
        <span key={l} style={{
          padding: '7px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          background: a ? 'var(--ink-900)' : 'transparent',
          color: a ? '#fff' : 'var(--ink-500)',
        }}>{l}</span>
      ))}
    </div>

    {/* 4 request type cards — restrained, all-purple accent */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
      {[
        { ic: 'refresh-cw', t: 'Change Request', d: 'Configuration, firewall, DNS, or system changes.', sla: '3–5 days', avg: '2 days' },
        { ic: 'life-buoy', t: 'Support Ticket', d: 'Something is broken or not working as expected.', sla: '< 4 hours', avg: '1.4 hours', popular: true },
        { ic: 'box', t: 'Service Request', d: 'New software, access, accounts, or onboarding.', sla: '1–3 days', avg: '1 day' },
        { ic: 'monitor', t: 'Asset Request', d: 'Hardware, peripherals, or software licenses.', sla: '5–10 days', avg: '4 days' },
      ].map(c => (
        <div key={c.t} style={{
          background: 'var(--card)', border: '1px solid', borderColor: c.popular ? 'var(--purple-700)' : 'var(--ink-100)',
          borderRadius: 14, padding: 20, position: 'relative', cursor: 'pointer',
          boxShadow: c.popular ? '0 0 0 4px var(--purple-50)' : 'none',
        }}>
          {c.popular && <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--purple-700)' }}>· MOST USED</span>}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name={c.ic} size={16} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{c.t}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4, lineHeight: 1.5, minHeight: 36 }}>{c.d}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ink-100)', fontSize: 11, color: 'var(--ink-500)' }}>
            <span>SLA <b style={{ color: 'var(--ink-900)' }}>{c.sla}</b></span>
            <span>Avg <b style={{ color: 'var(--ink-900)' }}>{c.avg}</b></span>
          </div>
        </div>
      ))}
    </div>

    {/* Service catalog — categorized, search-first */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Service catalog</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Pre-templated requests — faster than starting blank.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '6px 12px', width: 240 }}>
          <Icon name="search" size={13} color="var(--ink-500)" />
          <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit' }} placeholder="Search the catalog…" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          ['Access & accounts', 'key', ['VPN access', 'GitLab access', 'Email alias', 'Shared drive']],
          ['Hardware', 'monitor', ['New laptop', 'Replacement keyboard', 'External monitor', 'Headset']],
          ['Help & fixes', 'life-buoy', ['Password reset', 'Outlook issue', 'Slack notifications', 'Printer setup']],
        ].map(([cat, ic, items]) => (
          <div key={cat} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--card)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={12} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-700)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{cat}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {items.map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-900)' }}>
                  <span>{n}</span>
                  <Icon name="arrow-right" size={11} color="var(--ink-500)" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Two-col: Recent + Apps */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 12 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Your recent requests</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>Reuse one as a template, or check status.</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
        </div>
        {[
          ['ST-9812', 'Outlook crash on shared mailbox', 'In progress', 'purple'],
          ['SR-2098', 'GitLab access for new repo', 'Resolved', 'green'],
          ['AR-0301', 'Replacement keyboard', 'Pending', 'amber'],
        ].map(([id, t, s, tone], i, a) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', minWidth: 64 }}>{id}</span>
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-900)' }}>{t}</span>
            <Pill tone={tone === 'green' ? 'green' : tone === 'amber' ? 'amber' : 'purple'}>{s}</Pill>
            <Icon name="copy" size={13} color="var(--ink-500)" style={{ cursor: 'pointer' }} />
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>Your apps</div>
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
  </AdminShellPaper>
);

// ── Services Variant C: Top-nav + service catalog as primary ──
const AdminServicesTopFrame = () => (
  <AdminShellTop active="services">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>What can we help with?</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Search the catalog or pick a request type below.</div>
      </div>
    </div>

    {/* Hero search */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 24, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: 99, background: 'radial-gradient(circle, var(--purple-50) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 12, padding: '14px 18px' }}>
        <Icon name="search" size={18} color="var(--purple-700)" />
        <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontFamily: 'inherit' }} placeholder="What do you need? Try 'VPN access' or 'new laptop'…" />
        <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>or browse below</span>
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Trending</span>
        {['VPN access', 'Password reset', 'New laptop', 'Email alias', 'GitLab access'].map(t => (
          <span key={t} style={{ padding: '5px 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99, fontSize: 12, color: 'var(--ink-700)', fontWeight: 500, cursor: 'pointer' }}>{t}</span>
        ))}
      </div>
    </div>

    {/* 4 type tiles — pure ink, no purple flood */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
      {[
        { ic: 'refresh-cw', t: 'Change', d: 'Config, firewall, DNS' },
        { ic: 'life-buoy', t: 'Support', d: 'Something broken' },
        { ic: 'box', t: 'Service', d: 'Software & access' },
        { ic: 'monitor', t: 'Asset', d: 'Hardware & licenses' },
      ].map(c => (
        <div key={c.t} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper)', border: '1px solid var(--ink-100)', color: 'var(--ink-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Icon name={c.ic} size={17} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{c.t} request</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>{c.d}</div>
          </div>
          <Icon name="arrow-right" size={14} color="var(--ink-500)" />
        </div>
      ))}
    </div>

    {/* Two-col: Catalog vs Apps */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>Service catalog</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            ['VPN access', 'Access · 1 day SLA', 'shield'],
            ['Password reset', 'Help · self-service', 'key'],
            ['New laptop request', 'Hardware · 5–10 days', 'monitor'],
            ['Email alias', 'Access · same day', 'mail'],
            ['GitLab repo access', 'Access · 1 day SLA', 'git-branch'],
            ['Replacement peripherals', 'Hardware · 3 days', 'box'],
          ].map(([n, m, ic], i, a) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--ink-100)' : 'none', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>{m}</div>
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600 }}>Request</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>Your apps</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            ['E', 'var(--ink-900)', 'var(--card)', 'ERPNext'],
            ['N', '#fff', '#0082c9', 'Nextcloud'],
            ['S', '#fff', 'var(--orange-600)', 'Synx FMS'],
            ['S', '#fff', 'var(--blue-600)', 'Synx Sched'],
            ['S', '#fff', 'var(--violet-600)', 'Steward'],
            ['M', '#fff', 'var(--amber-600)', 'Mailcow'],
            ['I', '#fff', 'var(--purple-700)', 'Internship'],
            ['C', '#fff', 'var(--ink-900)', 'Comfac IT'],
            ['+', 'var(--ink-500)', 'var(--paper)', '5 more'],
          ].map(([l, fg, bg, n], i) => (
            <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <ServiceGlyph letter={l} color={fg} bg={bg} />
              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-700)', textAlign: 'center' }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminShellTop>
);

window.AdminDashboardPaperFrame = AdminDashboardPaperFrame;
window.AdminDashboardTopFrame = AdminDashboardTopFrame;
window.AdminServicesPaperFrame = AdminServicesPaperFrame;
window.AdminServicesTopFrame = AdminServicesTopFrame;
