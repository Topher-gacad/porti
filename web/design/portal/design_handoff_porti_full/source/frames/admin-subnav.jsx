// Top nav with submenus — two patterns demonstrated
// 1. Secondary tab row inside a section (Settings)
// 2. Mega-menu hover state on a top tab (People)

const AdminTopWithSubnav = ({ children, height = 1000, megaOpen = false }) => {
  const PoroMark = window.PoroMark;
  const tabs = [
    ['dashboard', 'home', 'Dashboard'],
    ['services', 'grid', 'Services'],
    ['requests', 'inbox', 'Requests', '4', false],
    ['kb', 'book', 'Knowledge Base'],
    ['people', 'users', 'People', null, true],     // has dropdown
    ['insights', 'bar-chart', 'Insights', null, true],
    ['settings', 'settings', 'Settings', null, true, true], // active
  ];
  return (
    <BrowserChrome url="porti.comfac-it.com/admin/settings/integrations" height={height}>
      <div className="frame" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
        <div style={{ height: 56, padding: '0 28px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
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
            <button style={tBtn}><Icon name="bell" size={15} color="var(--ink-700)" /></button>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: 8 }}>TC</div>
          </div>
        </div>

        {/* Tab row */}
        <div style={{ height: 44, padding: '0 28px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto', position: 'relative' }}>
          {tabs.map(([id, ic, l, badge, hasMenu, a]) => (
            <a key={id} style={{
              position: 'relative', height: '100%', display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0 14px', fontSize: 12.5, fontWeight: a ? 600 : 500,
              color: a ? 'var(--ink-900)' : (hasMenu && id === 'people' && megaOpen ? 'var(--ink-900)' : 'var(--ink-500)'),
              cursor: 'pointer',
              background: hasMenu && id === 'people' && megaOpen ? 'var(--paper)' : 'transparent',
            }}>
              <Icon name={ic} size={13} />
              {l}
              {hasMenu && <Icon name="chevron-down" size={11} />}
              {badge && <span style={{ fontSize: 9.5, padding: '1.5px 6px', background: 'var(--purple-700)', color: '#fff', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
              {a && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, background: 'var(--purple-700)', borderRadius: 99 }} />}
            </a>
          ))}

          {/* Mega-menu floating panel under "People" */}
          {megaOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 380, marginTop: 4, width: 560,
              background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12,
              padding: 18, boxShadow: '0 24px 60px -20px rgba(20,17,15,.18), 0 8px 24px -12px rgba(20,17,15,.10)',
              zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}>
              {[
                ['Directory', [['All people', 'users', '147'], ['IT staff', 'shield', '19'], ['Interns', 'briefcase', '25'], ['Pending invites', 'mail', '3']]],
                ['Manage', [['Roles & permissions', 'key', null], ['Teams', 'grid', null], ['Invite codes', 'link', null], ['Offboarding', 'log-out', null]]],
              ].map(([cat, items]) => (
                <div key={cat}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>{cat}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {items.map(([n, ic, count]) => (
                      <a key={n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-900)', cursor: 'pointer' }}>
                        <Icon name={ic} size={13} color="var(--purple-700)" />
                        <span style={{ flex: 1 }}>{n}</span>
                        {count && <span style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{count}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secondary tab row — only on sections with children */}
        <div style={{ padding: '0 28px', background: 'var(--card)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 4, flex: '0 0 auto', overflow: 'hidden' }}>
          {[['General', false], ['Integrations', true], ['Notifications', false], ['Authentication', false], ['Branding', false], ['Audit log', false], ['Billing', false]].map(([l, a]) => (
            <a key={l} style={{
              position: 'relative', padding: '11px 12px', fontSize: 12, fontWeight: a ? 600 : 500,
              color: a ? 'var(--purple-700)' : 'var(--ink-500)', cursor: 'pointer',
            }}>
              {l}
              {a && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, background: 'var(--purple-700)', borderRadius: 99 }} />}
            </a>
          ))}
        </div>

        {/* Breadcrumb + content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 32px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Settings</span>
            <Icon name="chevron-right" size={11} />
            <span style={{ color: 'var(--ink-700)', fontWeight: 600 }}>Integrations</span>
          </div>
          {children}
        </div>
      </div>
    </BrowserChrome>
  );
};

const TopSubnavSecondaryFrame = () => (
  <AdminTopWithSubnav megaOpen={false}>
    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink-900)', marginBottom: 4 }}>Integrations</div>
    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 22 }}>Connect Porti to the tools your team already uses.</div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {[
        ['Slack', 'Send ticket alerts to channels', true, '#4a154b'],
        ['Microsoft Teams', 'Approval flows in Teams', false, '#5059c9'],
        ['Google Workspace', 'SSO + calendar sync', true, '#ea4335'],
        ['Jira', 'Mirror tickets to engineering board', false, '#0052cc'],
        ['GitHub', 'Auto-create issues from CR tickets', false, '#1a1622'],
        ['Webhook', 'Custom outbound events', false, 'var(--ink-700)'],
      ].map(([n, d, on, c]) => (
        <div key={n} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{n[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>{d}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--ink-100)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: on ? 'var(--green-600)' : 'var(--ink-500)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} /> {on ? 'Connected' : 'Not connected'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>{on ? 'Configure' : 'Connect'} →</span>
          </div>
        </div>
      ))}
    </div>
  </AdminTopWithSubnav>
);

const TopSubnavMegaFrame = () => (
  <AdminTopWithSubnav megaOpen={true}>
    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink-900)', marginBottom: 4 }}>Settings · Integrations</div>
    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 22 }}>Hovering "People" reveals the mega-menu — wider sections fit columns of children.</div>
    <div style={{ background: 'var(--card)', border: '1px dashed var(--ink-200)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--ink-500)', fontSize: 12 }}>
      Page content (dimmed while menu is open)
    </div>
  </AdminTopWithSubnav>
);

window.TopSubnavSecondaryFrame = TopSubnavSecondaryFrame;
window.TopSubnavMegaFrame = TopSubnavMegaFrame;
