// All Services modal — opens when user clicks "5 more" on landing
// Uses same backdrop language as login (matte paper + lavender corner glows)

const AllServicesFrame = ({ width = 1280, height = 820 }) => (
  <BrowserChrome url="porti.comfac-it.com/#services" height={height}>
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Dimmed landing behind */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--paper)', filter: 'blur(2px)', opacity: .6 }}>
        <div style={{ height: 60, background: '#fff', borderBottom: '1px solid var(--ink-100)' }} />
      </div>
      {/* Light dim layer */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(39,32,48,.08)' }} />

      {/* Brand glows — same as login */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -240, left: -160, width: 540, height: 540, background: 'radial-gradient(circle, rgba(91,77,200,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Modal */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '100%', maxWidth: 880, maxHeight: 680,
        background: 'var(--card)', borderRadius: 18,
        boxShadow: '0 30px 80px -20px rgba(0,0,0,.45), 0 8px 24px -8px rgba(0,0,0,.2)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink-900)' }}>All services</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>13 internal apps available across COMFAC</div>
          </div>
          <Icon name="x" size={16} color="var(--ink-500)" style={{ cursor: 'pointer' }} />
        </div>

        {/* Search + filter chips */}
        <div style={{ padding: '14px 24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--paper)', border: '1.5px solid var(--ink-200)',
            borderRadius: 10, padding: '10px 12px',
          }}>
            <Icon name="search" size={14} color="var(--ink-500)" />
            <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="Search services or apps…" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', padding: '2px 6px', border: '1px solid var(--ink-200)', borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {[['All', true], ['Productivity', false], ['Operations', false], ['Comms', false], ['Internal tools', false]].map(([name, active]) => (
              <div key={name} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                background: active ? 'var(--purple-700)' : 'var(--paper)',
                color: active ? '#fff' : 'var(--ink-700)',
                border: '1px solid', borderColor: active ? 'var(--purple-700)' : 'var(--ink-200)',
              }}>{name}</div>
            ))}
          </div>
        </div>

        {/* Service grid — scrolls inside modal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 20px' }}>
          {[
            ['Productivity', [
              ['E', 'var(--ink-900)', 'var(--card)', 'ERPNext', 'Finance, HR, inventory'],
              ['N', '#fff', '#0082c9', 'Nextcloud', 'Files, calendar, contacts'],
              ['M', '#fff', 'var(--amber-600)', 'Mailcow', 'Email & groupware'],
            ]],
            ['Operations', [
              ['S', '#fff', 'var(--orange-600)', 'Synx FMS', 'Facility maintenance'],
              ['S', '#fff', 'var(--blue-600)', 'Synx Sched', 'Crew scheduling'],
              ['S', '#fff', 'var(--violet-600)', 'Steward', 'Asset & inventory'],
              ['F', '#fff', 'var(--green-600)', 'Fleet', 'Vehicle tracking'],
            ]],
            ['Comms', [
              ['R', '#fff', '#5865F2', 'Rocket.Chat', 'Internal messaging'],
              ['J', '#fff', '#2684FF', 'Jitsi', 'Video conferencing'],
            ]],
            ['Internal tools', [
              ['C', '#fff', 'var(--purple-700)', 'Porti', 'IT service portal'],
              ['G', '#fff', 'var(--ink-900)', 'Gitea', 'Source control'],
              ['W', '#fff', '#1568b3', 'Wiki', 'Internal knowledge base'],
              ['B', '#fff', 'var(--rose-600)', 'BookStack', 'Documentation'],
            ]],
          ].map(([category, items]) => (
            <div key={category} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>{category}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {items.map(([letter, fg, bg, name, desc]) => (
                  <div key={name} style={{
                    background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 12,
                    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  }}>
                    <ServiceGlyph letter={letter} color={fg} bg={bg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>{desc}</div>
                    </div>
                    <Icon name="arrow-up-right" size={14} color="var(--ink-500)" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--paper)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Need an app that's not here? <span style={{ color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>Request access →</span></div>
          <div style={{ fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View full directory →</div>
        </div>
      </div>
    </div>
  </BrowserChrome>
);

window.AllServicesFrame = AllServicesFrame;
