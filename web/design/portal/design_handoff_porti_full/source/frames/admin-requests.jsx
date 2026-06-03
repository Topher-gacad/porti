// Admin Requests page — top-nav shell, redesigned content & layout.

const AdminRequestsTopFrame = () => {
  const rows = [
    ['ST-231', 'ST', 'Support', 'Portal issue — login button unresponsive', 'Cassandra Beleno', 'Med', 'Pending', null, '14m'],
    ['AR-230', 'AR', 'Asset', 'Laptop for sales presentation', 'Joshua K. Tan', 'High', 'Pending', null, '1h'],
    ['ST-229', 'ST', 'Support', 'Wifi voucher request', 'Gio Hernandez', 'High', 'Cancelled', null, '6d'],
    ['SR-228', 'SR', 'Service', 'Checking of DELL R790 servers', 'Edmund Cruz', 'Critical', 'In progress', 'breach', '8d'],
    ['CR-227', 'CR', 'Change', 'Mounting of UPS in data rack', 'Edmund Cruz', 'High', 'In progress', 'breach', '8d'],
    ['ST-226', 'ST', 'Support', 'GoDaddy CSC account recovery', 'Edmund Cruz', 'High', 'Resolved', 'breach', '8d'],
    ['ST-225', 'ST', 'Support', 'SECADA error / suggestion', 'Shekinah Tejada', 'Med', 'In progress', 'breach', '8d'],
    ['ST-224', 'ST', 'Support', 'Email signature template not loading', 'Marie Lim', 'Low', 'Pending', null, '9d'],
  ];

  const typeColor = t => ({
    ST: ['var(--purple-50)', 'var(--purple-700)'],
    AR: ['var(--orange-50)', 'var(--orange-600)'],
    SR: ['var(--blue-50)', 'var(--blue-600)'],
    CR: ['var(--green-50)', 'var(--green-600)'],
  }[t]);

  const statusPill = s => {
    const map = {
      'Pending': ['var(--amber-50)', 'var(--amber-600)'],
      'In progress': ['var(--purple-50)', 'var(--purple-700)'],
      'Resolved': ['var(--green-50)', 'var(--green-600)'],
      'Cancelled': ['var(--ink-100)', 'var(--ink-500)'],
    };
    const [bg, fg] = map[s];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 9px', background: bg, color: fg, borderRadius: 99 }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'currentColor' }} /> {s}
      </span>
    );
  };

  return (
    <AdminShellTop active="requests">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>Requests</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Triage, assign, and resolve everything coming through Porti.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...tBtn, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', display: 'inline-flex', gap: 6 }}>
            <Icon name="download" size={13} /> Export CSV
          </button>
          <button style={{ ...primaryAdmin }}>
            <Icon name="plus" size={13} /> New request
          </button>
        </div>
      </div>

      {/* Saved views row — replaces the heavy status cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, borderBottom: '1px solid var(--ink-100)' }}>
        {[
          ['All requests', '228', false],
          ['Needs triage', '2', false, 'amber'],
          ['My queue', '4', true, 'purple'],
          ['SLA at risk', '5', false, 'rose'],
          ['Awaiting requester', '8', false],
          ['Closed this week', '23', false],
        ].map(([l, c, a, tone]) => (
          <a key={l} style={{
            position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 14px', fontSize: 12.5, fontWeight: a ? 600 : 500,
            color: a ? 'var(--ink-900)' : 'var(--ink-500)', cursor: 'pointer',
          }}>
            {l}
            <span style={{
              fontSize: 10.5, padding: '1.5px 7px', borderRadius: 99, fontWeight: 700,
              background: tone === 'rose' ? 'var(--rose-50)' : tone === 'amber' ? 'var(--amber-50)' : tone === 'purple' ? 'var(--purple-50)' : 'var(--ink-100)',
              color: tone === 'rose' ? 'var(--rose-600)' : tone === 'amber' ? 'var(--amber-600)' : tone === 'purple' ? 'var(--purple-700)' : 'var(--ink-500)',
            }}>{c}</span>
            {a && <span style={{ position: 'absolute', left: 14, right: 14, bottom: -1, height: 2, background: 'var(--purple-700)', borderRadius: 99 }} />}
          </a>
        ))}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer', padding: '8px 4px' }}>
          <Icon name="plus" size={11} /> Save current view
        </span>
      </div>

      {/* Compact filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '8px 12px' }}>
          <Icon name="search" size={14} color="var(--ink-500)" />
          <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="Search by title, ID, requester…" />
        </div>
        {[['Type', 'All'], ['Status', 'Open'], ['Priority', 'Any'], ['Assignee', 'Anyone'], ['Created', 'Last 30d']].map(([k, v]) => (
          <button key={k} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: 'var(--ink-700)', fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ink-500)' }}>{k}:</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
            <Icon name="chevron-down" size={11} color="var(--ink-500)" />
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 80px 80px 1fr 200px 90px 130px 70px 100px 32px', gap: 14, alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid var(--ink-100)', background: 'var(--paper)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
          <input type="checkbox" style={{ accentColor: 'var(--purple-700)' }} />
          <span>ID</span>
          <span>Type</span>
          <span>Title</span>
          <span>Requester</span>
          <span>Priority</span>
          <span>Status</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Age <Icon name="arrow-up" size={9} /></span>
          <span>Assignee</span>
          <span></span>
        </div>

        {rows.map(([id, code, type, title, who, prio, status, breach, age], i) => {
          const [bg, fg] = typeColor(code);
          const prioColor = prio === 'Critical' ? 'var(--rose-600)' : prio === 'High' ? 'var(--orange-600)' : prio === 'Med' ? 'var(--amber-600)' : 'var(--ink-500)';
          return (
            <div key={id} style={{
              display: 'grid', gridTemplateColumns: '32px 80px 80px 1fr 200px 90px 130px 70px 100px 32px', gap: 14, alignItems: 'center',
              padding: '13px 18px', borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none',
              cursor: 'pointer', position: 'relative',
            }}>
              <input type="checkbox" style={{ accentColor: 'var(--purple-700)' }} />
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>{id}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', background: bg, color: fg, borderRadius: 6, justifySelf: 'start' }}>{type}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                {breach && (
                  <div style={{ fontSize: 10.5, color: 'var(--rose-600)', fontWeight: 600, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="alert-triangle" size={9} /> SLA breached · 4h overdue
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, flex: '0 0 auto' }}>
                  {who.split(' ').map(x => x[0]).join('').slice(0, 2)}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{who}</span>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: prioColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} /> {prio}
              </span>
              {statusPill(status)}
              <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{age}</span>
              <span style={{ fontSize: 11.5, color: i % 3 === 0 ? 'var(--ink-500)' : 'var(--ink-700)', fontStyle: i % 3 === 0 ? 'italic' : 'normal' }}>{i % 3 === 0 ? 'Unassigned' : ['Jay L.', 'Joan C.', 'Aldo R.', 'Mira S.'][i % 4]}</span>
              <Icon name="more-horizontal" size={14} color="var(--ink-500)" />
            </div>
          );
        })}

        {/* Footer / pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: 'var(--paper)', borderTop: '1px solid var(--ink-100)', fontSize: 11.5, color: 'var(--ink-500)' }}>
          <span>Showing 1–8 of 228</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <button style={{ ...tBtn, padding: '5px 9px' }}><Icon name="chevron-left" size={12} color="var(--ink-700)" /></button>
            <span style={{ padding: '0 10px', color: 'var(--ink-700)', fontWeight: 600 }}>1 / 29</span>
            <button style={{ ...tBtn, padding: '5px 9px' }}><Icon name="chevron-right" size={12} color="var(--ink-700)" /></button>
          </div>
        </div>
      </div>
    </AdminShellTop>
  );
};

window.AdminRequestsTopFrame = AdminRequestsTopFrame;
