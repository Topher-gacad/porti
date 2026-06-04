// My Requests — two views demonstrating the merge proposal:
// 1. Admin: "Submitted by me" tab inside the unified Requests page (table view)
// 2. Non-admin: lightweight card/timeline tracker (same data, friendlier presentation)

const AdminSubmittedByMeFrame = () => {
  const rows = [
    ['SR-2104', 'SR', 'Service', 'New laptop request — replacement for aging Macbook', 'High', 'In progress', '2d', 'Jay L.', '60'],
    ['ST-9812', 'ST', 'Support', 'Outlook crash on shared mailbox', 'Critical', 'In progress', '3h', 'Joan C.', '30'],
    ['SR-2098', 'SR', 'Service', 'GitLab access for new repo', 'Med', 'Resolved', '5d', 'Aldo R.', '100'],
    ['AR-0301', 'AR', 'Asset', 'Replacement keyboard', 'Low', 'Pending', '1d', 'Unassigned', '10'],
    ['ST-9750', 'ST', 'Support', 'VPN dropping every 30min', 'High', 'Resolved', '12d', 'Jay L.', '100'],
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>Requests</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>One inbox · switch perspective with the tabs below.</div>
        </div>
        <button style={{ ...primaryAdmin }}><Icon name="plus" size={13} /> New request</button>
      </div>

      {/* Saved-views strip — "Submitted by me" is now the active tab */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, borderBottom: '1px solid var(--ink-100)' }}>
        {[
          ['All requests', '228', false],
          ['Needs triage', '2', false, 'amber'],
          ['Assigned to me', '4', false, 'purple'],
          ['Submitted by me', '5', true, 'purple'],
          ['SLA at risk', '5', false, 'rose'],
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
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '8px 12px' }}>
          <Icon name="search" size={14} color="var(--ink-500)" />
          <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} placeholder="Search my requests…" />
        </div>
        {[['Type', 'All'], ['Status', 'Open']].map(([k, v]) => (
          <button key={k} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: 'var(--ink-700)', fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ink-500)' }}>{k}:</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
            <Icon name="chevron-down" size={11} color="var(--ink-500)" />
          </button>
        ))}
      </div>

      {/* Table — same skeleton, but "Requester" column drops since they're all me */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 1fr 90px 130px 70px 110px 110px 32px', gap: 14, alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid var(--ink-100)', background: 'var(--paper)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
          <span>ID</span>
          <span>Type</span>
          <span>Title</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Age</span>
          <span>Assignee</span>
          <span>Progress</span>
          <span></span>
        </div>
        {rows.map(([id, code, type, title, prio, status, age, who, prog], i) => {
          const [bg, fg] = typeColor(code);
          const prioColor = prio === 'Critical' ? 'var(--rose-600)' : prio === 'High' ? 'var(--orange-600)' : prio === 'Med' ? 'var(--amber-600)' : 'var(--ink-500)';
          return (
            <div key={id} style={{ display: 'grid', gridTemplateColumns: '90px 80px 1fr 90px 130px 70px 110px 110px 32px', gap: 14, alignItems: 'center', padding: '13px 18px', borderBottom: i < rows.length - 1 ? '1px solid var(--ink-100)' : 'none', cursor: 'pointer' }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>{id}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', background: bg, color: fg, borderRadius: 6, justifySelf: 'start' }}>{type}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: prioColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} /> {prio}
              </span>
              {statusPill(status)}
              <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{age}</span>
              <span style={{ fontSize: 11.5, color: who === 'Unassigned' ? 'var(--ink-500)' : 'var(--ink-700)', fontStyle: who === 'Unassigned' ? 'italic' : 'normal' }}>{who}</span>
              <div style={{ height: 6, background: 'var(--paper)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${prog}%`, height: '100%', background: prog === '100' ? 'var(--green-600)' : 'var(--purple-700)', borderRadius: 99 }} />
              </div>
              <Icon name="chevron-right" size={13} color="var(--ink-500)" />
            </div>
          );
        })}
      </div>
    </AdminShellTop>
  );
};

// ── Non-admin: lightweight card tracker (same URL, role-gated) ──
const MyRequestsCardFrame = () => {
  const cards = [
    {
      id: 'SR-2104', type: 'SR', t: 'New laptop request',
      sub: 'Replacement for aging Macbook',
      status: 'In progress', tone: 'purple', step: 3, total: 4, eta: '2 days',
      assignee: 'Jay L. · IT Support', last: 'Approved by manager · awaiting procurement',
    },
    {
      id: 'ST-9812', type: 'ST', t: 'Outlook crash on shared mailbox',
      sub: 'Affects 3 mailboxes',
      status: 'In progress', tone: 'purple', step: 2, total: 4, eta: 'Today',
      assignee: 'Joan C. · IT Support', last: 'Joan replied 18m ago',
      unread: 1,
    },
    {
      id: 'AR-0301', type: 'AR', t: 'Replacement keyboard',
      sub: 'Logitech MX Keys',
      status: 'Pending', tone: 'amber', step: 1, total: 4, eta: 'Awaiting triage',
      assignee: 'Unassigned', last: 'Submitted yesterday',
    },
    {
      id: 'SR-2098', type: 'SR', t: 'GitLab access for new repo',
      sub: 'For project Atlas',
      status: 'Resolved', tone: 'green', step: 4, total: 4, eta: 'Closed 5 days ago',
      assignee: 'Aldo R. · Sysadmin', last: 'You marked this resolved',
    },
  ];
  const typeColor = t => ({
    ST: ['var(--purple-50)', 'var(--purple-700)'],
    AR: ['var(--orange-50)', 'var(--orange-600)'],
    SR: ['var(--blue-50)', 'var(--blue-600)'],
    CR: ['var(--green-50)', 'var(--green-600)'],
  }[t]);
  const toneFG = t => t === 'green' ? 'var(--green-600)' : t === 'amber' ? 'var(--amber-600)' : 'var(--purple-700)';
  const toneBG = t => t === 'green' ? 'var(--green-50)' : t === 'amber' ? 'var(--amber-50)' : 'var(--purple-50)';

  return (
    <AdminShellTop active="requests">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>My requests</div>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>4 active · everything you've submitted recently.</div>
        </div>
        <button style={{ ...primaryAdmin }}><Icon name="plus" size={13} /> New request</button>
      </div>

      {/* Filter row — light: status chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['All', 5, true], ['Open', 3, false], ['Resolved', 2, false], ['Cancelled', 0, false]].map(([l, c, a]) => (
          <span key={l} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: a ? 'var(--ink-900)' : 'var(--card)',
            color: a ? '#fff' : 'var(--ink-700)',
            border: '1px solid', borderColor: a ? 'var(--ink-900)' : 'var(--ink-100)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {l} <span style={{ opacity: .6, fontWeight: 500 }}>{c}</span>
          </span>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cards.map(c => {
          const [tbg, tfg] = typeColor(c.type);
          return (
            <div key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20, cursor: 'pointer', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>{c.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: tbg, color: tfg, borderRadius: 5 }}>{c.type}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '2px 9px', background: toneBG(c.tone), color: toneFG(c.tone), borderRadius: 99 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: 'currentColor' }} /> {c.status}
                    </span>
                    {c.unread && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'var(--rose-600)', color: '#fff', borderRadius: 99 }}>{c.unread} new reply</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: -0.2 }}>{c.t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>{c.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>ETA</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.tone === 'green' ? 'var(--green-600)' : 'var(--ink-900)', marginTop: 2 }}>{c.eta}</div>
                </div>
              </div>

              {/* Step timeline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                {['Submitted', 'Triaged', 'In progress', 'Resolved'].map((s, i) => {
                  const done = i < c.step;
                  const cur = i === c.step - 1 && c.tone !== 'green';
                  const final = c.tone === 'green' && i === 3;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 99,
                          background: done || final ? (final ? 'var(--green-600)' : cur ? 'var(--purple-700)' : 'var(--purple-700)') : 'var(--paper)',
                          border: '1px solid', borderColor: done || final ? 'transparent' : 'var(--ink-200)',
                          color: done || final ? '#fff' : 'var(--ink-500)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                        }}>
                          {done || final ? <Icon name={cur ? 'clock' : 'check'} size={10} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 10, color: done ? 'var(--ink-700)' : 'var(--ink-500)', fontWeight: cur || final ? 700 : 500 }}>{s}</span>
                      </div>
                      {i < 3 && <div style={{ flex: 1, height: 2, background: i < c.step - 1 || final ? 'var(--purple-700)' : 'var(--ink-200)', borderRadius: 99, marginBottom: 16 }} />}
                    </React.Fragment>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 99, background: c.assignee === 'Unassigned' ? 'var(--ink-100)' : 'var(--purple-50)', color: c.assignee === 'Unassigned' ? 'var(--ink-500)' : 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700 }}>
                  {c.assignee === 'Unassigned' ? '?' : c.assignee.split(' ').slice(0, 2).map(x => x[0]).join('')}
                </div>
                <span style={{ fontSize: 12, color: c.assignee === 'Unassigned' ? 'var(--ink-500)' : 'var(--ink-700)', fontStyle: c.assignee === 'Unassigned' ? 'italic' : 'normal' }}>{c.assignee}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-500)', flex: 1 }}>· {c.last}</span>
                <span style={{ fontSize: 12, color: 'var(--purple-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Open <Icon name="arrow-right" size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShellTop>
  );
};

window.AdminSubmittedByMeFrame = AdminSubmittedByMeFrame;
window.MyRequestsCardFrame = MyRequestsCardFrame;
