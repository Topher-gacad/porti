// Interns module — 6 sub-pages, workflow-first redesign
// Each page leads with the primary action / decision, not the data dump.

const internsNav = [
  ['roster', 'Roster', 26],
  ['invites', 'Invite Codes', 12],
  ['wifi', 'WiFi Vouchers', null],
  ['seats', 'Seat Map', null],
  ['security', 'Security', 3],
  ['planning', 'Planning', null],
  ['attendance', 'Attendance', null],
];

const InternsSubnav = ({ active }) => (
  <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--ink-100)', marginBottom: 20, overflowX: 'auto' }}>
    {internsNav.map(([id, l, n]) => (
      <span key={id} style={{
        padding: '10px 14px', fontSize: 13, fontWeight: id === active ? 700 : 500,
        color: id === active ? 'var(--purple-700)' : 'var(--ink-700)',
        borderBottom: id === active ? '2px solid var(--purple-700)' : '2px solid transparent',
        marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      }}>
        {l}
        {n != null && <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 99, background: id === active ? 'var(--purple-50)' : 'var(--ink-50, #f3f4f6)', color: id === active ? 'var(--purple-700)' : 'var(--ink-500)', fontWeight: 700 }}>{n}</span>}
      </span>
    ))}
  </div>
);

const InternsHeader = ({ title, sub, primary, secondary }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>{sub}</div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {secondary?.map((s, i) => (
        <button key={i} style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {s.icon && <Icon name={s.icon} size={13} />} {s.label}
        </button>
      ))}
      {primary && (
        <button style={{ ...primaryAdmin }}>
          {primary.icon && <Icon name={primary.icon} size={13} />} {primary.label}
        </button>
      )}
    </div>
  </div>
);

const QuickLinks = ({ items }) => (
  <div style={{ background: 'var(--paper)', border: '1px dashed var(--ink-200)', borderRadius: 10, padding: 12, marginTop: 14 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Related</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(([ic, l]) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 99, fontSize: 12, color: 'var(--ink-700)', fontWeight: 600, cursor: 'pointer' }}>
          <Icon name={ic} size={12} color="var(--purple-700)" /> {l} <Icon name="arrow-right" size={11} color="var(--ink-500)" />
        </span>
      ))}
    </div>
  </div>
);

const KpiStrip = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12, marginBottom: 14 }}>
    {items.map(([l, v, sub, color], i) => (
      <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{l}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--ink-900)', letterSpacing: -0.5, marginTop: 4 }}>{v}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>}
      </div>
    ))}
  </div>
);

const Decision = ({ verdict, headline, reasons, cta }) => (
  <div style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--card))', border: '1px solid var(--purple-200, #c4b5fd)', borderRadius: 14, padding: 18, marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
    <div style={{ width: 56, height: 56, borderRadius: 99, background: verdict === 'go' ? 'var(--green-600)' : 'var(--amber-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
      <Icon name={verdict === 'go' ? 'check' : 'alert-triangle'} size={24} color="#fff" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--purple-700)', textTransform: 'uppercase' }}>Recommendation</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginTop: 2 }}>{headline}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 4, lineHeight: 1.5 }}>{reasons}</div>
    </div>
    <button style={{ ...primaryAdmin, padding: '10px 16px' }}>{cta} <Icon name="arrow-right" size={13} /></button>
  </div>
);

// ─── 1. INVITE CODES ──────────────────────────────────────────────────────────
const inviteRows = [
  ['Mark G. Guerrero', 'mark.g@up.edu.ph', 'Batch · UPLB Summer 26', 'C7K9-Q2M4', 'Sent', '6d 4h', 'var(--green-600)'],
  ['Mira Soto', 'mira.s@dlsu.edu.ph', 'Batch · UPLB Summer 26', 'F3J1-R8N5', 'Used', '—', 'var(--ink-500)'],
  ['Pending — unsent', '—', 'Batch · UPLB Summer 26', 'H4P2-X9V7', 'Unsent', '7d 0h', 'var(--amber-600)'],
  ['Tina Lopez', 'tina.l@admu.edu.ph', 'Walk-in · Ateneo', 'B1R6-W3T2', 'Sent', '5d 12h', 'var(--green-600)'],
  ['Daryl Tan', 'daryl.t@feu.edu.ph', 'Walk-in · FEU', 'K8M3-D7A1', 'Expired', '—', 'var(--rose-600)'],
  ['Pending — unsent', '—', 'Batch · UPLB Summer 26', 'V5L9-S2E4', 'Unsent', '7d 0h', 'var(--amber-600)'],
];
const inviteStatusStyle = {
  Unsent: ['var(--amber-50)', 'var(--amber-600)'],
  Sent: ['var(--purple-50)', 'var(--purple-700)'],
  Used: ['var(--green-50)', 'var(--green-600)'],
  Expired: ['var(--ink-50, #f3f4f6)', 'var(--ink-500)'],
};

const InternsInvitesFrame = () => (
  <AdminShellTop active="people">
    <InternsSubnav active="invites" />
    <InternsHeader
      title="Invite Codes"
      sub="Create codes tied to a named applicant or batch. Send via email or share a claim link — no copy/paste."
      secondary={[{ icon: 'upload', label: 'Bulk from CSV' }, { icon: 'settings', label: 'Defaults' }]}
      primary={{ icon: 'plus', label: 'New invite' }}
    />

    <KpiStrip items={[
      ['Unsent', '4', 'Generated, not yet emailed', 'var(--amber-600)'],
      ['Sent · awaiting use', '5', 'Avg time-to-claim: 1.4d', 'var(--purple-700)'],
      ['Used this month', '11', '+3 vs. last month', 'var(--green-600)'],
      ['Expired (unused)', '2', 'Auto-cleaned weekly', 'var(--ink-500)'],
    ]} />

    {/* Quick create panel — workflow lead */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Icon name="zap" size={14} color="var(--purple-700)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Quick generate</span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Most coordinators do this 2× per intake.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.6fr 0.6fr auto', gap: 10, alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Batch label</label>
          <input defaultValue="Batch · UPLB Summer 26" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-900)', fontFamily: 'inherit' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Recipient emails (paste list)</label>
          <input placeholder="3 emails detected from clipboard…" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-700)', fontFamily: 'inherit' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Expires in</label>
          <select style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', background: 'var(--card)' }}>
            <option>7 days</option><option>14 days</option><option>30 days</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Send via</label>
          <select style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', background: 'var(--card)' }}>
            <option>Email now</option><option>Email + Slack DM</option><option>Just generate</option>
          </select>
        </div>
        <button style={{ ...primaryAdmin, padding: '9px 16px' }}>Generate &amp; Send</button>
      </div>
    </div>

    {/* Codes list */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>All codes</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All · 68', 'Unsent · 4', 'Sent · 5', 'Used · 57', 'Expired · 2'].map((t, i) => (
            <span key={t} style={{ padding: '4px 10px', fontSize: 11.5, fontWeight: 600, borderRadius: 99, background: i === 1 ? 'var(--ink-900)' : 'var(--paper)', color: i === 1 ? '#fff' : 'var(--ink-700)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <button style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--ink-700)', padding: '5px 11px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Resend all unsent (4)</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.1fr 0.8fr 0.8fr 140px', padding: '10px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--paper)' }}>
        <span>Recipient</span><span>Batch</span><span>Code</span><span>Status</span><span>Expires</span><span></span>
      </div>
      {inviteRows.map(([n, e, b, code, status, exp, c], i) => {
        const [bg, col] = inviteStatusStyle[status];
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.1fr 0.8fr 0.8fr 140px', padding: '12px 16px', borderBottom: i < inviteRows.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: n.startsWith('Pending') ? 'var(--ink-500)' : 'var(--ink-900)', fontStyle: n.startsWith('Pending') ? 'italic' : 'normal' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{e}</div>
            </div>
            <span style={{ color: 'var(--ink-700)' }}>{b}</span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, color: 'var(--ink-900)', background: 'var(--paper)', padding: '3px 7px', borderRadius: 6, justifySelf: 'start' }}>{code}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: bg, color: col, justifySelf: 'start' }}>{status}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-700)' }}>{exp !== '—' ? `in ${exp}` : '—'}</span>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              {status === 'Unsent' && <button style={{ background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Send</button>}
              {status === 'Sent' && <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Resend</button>}
              <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="copy" size={11} /></button>
              <button style={{ background: 'var(--card)', color: 'var(--ink-500)', border: '1px solid var(--ink-200)', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="more-horizontal" size={11} /></button>
            </div>
          </div>
        );
      })}
    </div>

    <QuickLinks items={[['users', 'Intern roster'], ['mail', 'Email templates'], ['file-text', 'Applications']]} />
  </AdminShellTop>
);

// ─── 2. WIFI VOUCHERS ─────────────────────────────────────────────────────────
const WifiVouchersFrame = () => (
  <AdminShellTop active="people">
    <InternsSubnav active="wifi" />
    <InternsHeader
      title="WiFi Vouchers"
      sub="Self-serve: interns claim per-device codes from a QR at the front desk. You monitor — you don't print."
      secondary={[{ icon: 'qr-code', label: 'Print QR poster' }, { icon: 'settings', label: 'Policy' }]}
      primary={{ icon: 'user-plus', label: 'Issue manually' }}
    />

    {/* Today panel */}
    <div style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--card))', border: '1px solid var(--purple-200, #c4b5fd)', borderRadius: 14, padding: 18, marginBottom: 14, display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 18, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--purple-700)', textTransform: 'uppercase' }}>Today · live</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.6, marginTop: 4 }}>14 claims · 2 pending</div>
        <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 4 }}>Auto-pool refills to 25 unused codes at midnight.</div>
      </div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Pool</div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>23 / 25</div></div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Devices online</div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-600)' }}>21</div></div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Anomalies</div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber-600)' }}>1</div></div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
      {/* How it works */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>How interns get on WiFi</div>
        {[
          ['1', 'Scan QR poster at the front desk', 'qr-code'],
          ['2', 'Enter their invite code or employee email', 'log-in'],
          ['3', 'System issues a single-device voucher · valid 12 hrs', 'wifi'],
          ['4', 'Re-claim daily — no admin in the loop', 'refresh-cw'],
        ].map(([n, t, ic]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: n !== '4' ? '1px solid var(--ink-100)' : 'none' }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--purple-50)', color: 'var(--purple-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flex: '0 0 auto' }}>{n}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-700)', flex: 1, lineHeight: 1.5 }}>{t}</span>
            <Icon name={ic} size={14} color="var(--ink-500)" />
          </div>
        ))}
      </div>
      {/* Anomalies */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Needs review · 1</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Auto-flagged today</span>
        </div>
        <div style={{ background: 'var(--rose-50)', border: '1px solid var(--rose-100, #fecaca)', borderRadius: 10, padding: 12, display: 'flex', gap: 10 }}>
          <Icon name="alert-triangle" size={16} color="var(--rose-600)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)' }}>Mira Soto claimed from 2 devices in 4 min</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-700)', marginTop: 2 }}>Pixel 7 (10.0.4.18) → MacBook Pro (10.0.4.45). Policy allows 1 device per claim.</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Allow this once</button>
              <button style={{ background: 'var(--rose-600)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Revoke 2nd device</button>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 10, padding: '8px 10px', background: 'var(--paper)', borderRadius: 8 }}>
          <Icon name="check" size={12} color="var(--green-600)" /> No abuse patterns detected in the last 7 days.
        </div>
      </div>
    </div>

    {/* Recent activity */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Recent claims (today)</div>
      {[
        ['08:42', 'Mark G. Guerrero', 'iPhone 14', 'Claimed', 'var(--green-600)'],
        ['08:51', 'Mira Soto', 'Pixel 7', 'Claimed', 'var(--green-600)'],
        ['08:55', 'Mira Soto', 'MacBook Pro', 'Flagged · 2nd device', 'var(--amber-600)'],
        ['09:12', 'Tina Lopez', 'Windows laptop', 'Claimed', 'var(--green-600)'],
        ['09:30', 'Daryl Tan', 'iPhone 12', 'Code expired · re-claimed', 'var(--ink-500)'],
      ].map(([t, n, dev, s, c], i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1.6fr 1.4fr 1.4fr', padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, alignItems: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--ink-500)' }}>{t}</span>
          <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{n}</span>
          <span style={{ color: 'var(--ink-700)' }}>{dev}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: c, justifySelf: 'start' }}>● {s}</span>
        </div>
      ))}
    </div>

    <QuickLinks items={[['shield', 'Security review'], ['users', 'Roster'], ['settings', 'Network policy']]} />
  </AdminShellTop>
);

// ─── 3. SEAT MAP ──────────────────────────────────────────────────────────────
const SeatMapFrame = () => {
  const seats = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) seats.push({ r, c });
  const occupied = { '0-0': 'Mark G.', '0-1': 'Mira S.', '0-3': 'Tina L.', '1-2': 'Daryl T.', '1-5': 'Joel A.', '2-0': 'Rina B.', '2-1': 'Sam K.', '2-7': 'Aiko M.', '3-3': 'Theo P.', '3-4': 'Lara Q.' };
  const broken = { '4-6': 'Broken monitor', '0-7': 'Reserved · Anna (Mon)' };
  const incoming = { '1-0': 'Arrives Mon', '2-3': 'Arrives Wed' };
  const todayHere = ['Mark G.', 'Mira S.', 'Tina L.', 'Daryl T.', 'Rina B.', 'Sam K.', 'Theo P.'];

  return (
    <AdminShellTop active="people">
      <InternsSubnav active="seats" />
      <InternsHeader
        title="Seat Map"
        sub="Click a seat to assign, reserve, or mark broken. Drag interns from the side panel onto seats."
        secondary={[{ icon: 'wand', label: 'Auto-fill empties (4)' }, { icon: 'download', label: 'Export PDF' }]}
        primary={{ icon: 'plus', label: 'Add seat / row' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
        <div>
          {/* Legend */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 12, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
            {[
              ['Occupied today', 'var(--purple-700)', '#fff'],
              ['Vacant', 'var(--card)', null],
              ['Reserved', 'var(--amber-50)', null],
              ['Incoming', 'var(--green-50)', null],
              ['Broken', 'var(--rose-50)', null],
            ].map(([l, bg, fg]) => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-700)' }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: '1px solid var(--ink-200)' }} /> {l}
              </span>
            ))}
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Floor 3 · Intern Bay</span>
          </div>

          {/* Map */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 22, position: 'relative' }}>
            {/* entrance marker */}
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--ink-900)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>Entry →</div>

            <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gap: 10 }}>
              {Array.from({ length: 5 }).map((_, r) => (
                <div key={r} style={{ display: 'grid', gridTemplateColumns: '24px repeat(8, 1fr)', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)' }}>{'ABCDE'[r]}</span>
                  {Array.from({ length: 8 }).map((__, c) => {
                    const k = `${r}-${c}`;
                    const occ = occupied[k];
                    const brk = broken[k];
                    const inc = incoming[k];
                    let bg = 'var(--card)', col = 'var(--ink-500)', bd = 'var(--ink-200)', label = `${'ABCDE'[r]}-${c + 1}`;
                    if (occ) { bg = 'var(--purple-700)'; col = '#fff'; bd = 'var(--purple-700)'; label = occ; }
                    else if (brk) { bg = 'var(--rose-50)'; col = 'var(--rose-600)'; bd = 'var(--rose-100, #fecaca)'; }
                    else if (inc) { bg = 'var(--green-50)'; col = 'var(--green-600)'; bd = 'var(--green-100, #bbf7d0)'; }
                    return (
                      <div key={c} style={{ background: bg, color: col, border: '1px solid ' + bd, borderRadius: 8, padding: '10px 6px', fontSize: 10.5, fontWeight: 600, textAlign: 'center', cursor: 'pointer', position: 'relative', minHeight: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {label}
                        {brk && <Icon name="alert-triangle" size={9} color="var(--rose-600)" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* selected seat callout */}
            <div style={{ position: 'absolute', right: 20, top: 20, background: 'var(--ink-900)', color: '#fff', borderRadius: 10, padding: 12, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>
              <div style={{ fontSize: 10.5, color: '#a8a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Selected · B-3</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Vacant</div>
              <div style={{ fontSize: 11.5, color: '#c8c4d6', marginTop: 4 }}>Near printer · west window</div>
              <button style={{ width: '100%', marginTop: 10, background: 'var(--purple-700)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Assign intern…</button>
              <button style={{ width: '100%', marginTop: 4, background: 'transparent', border: '1px solid #4a4458', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Mark broken</button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Here today · 7</div>
            {todayHere.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < todayHere.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                <Avatar initials={n.split(' ').map(x => x[0]).join('').slice(0, 2)} color={['var(--purple-700)', 'var(--orange-600)', 'var(--blue-600)', 'var(--rose-600)'][i % 4]} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{'A1 A2 A4 B3 C1 C2 D4'.split(' ')[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Unassigned · 3</div>
            {['Joel Alvarez', 'Aiko Mendoza', 'Lara Quinto'].map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--ink-100)' : 'none', cursor: 'grab' }}>
                <Icon name="move" size={11} color="var(--ink-500)" />
                <Avatar initials={n.split(' ').map(x => x[0]).join('').slice(0, 2)} color="var(--ink-500)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</span>
              </div>
            ))}
            <button style={{ width: '100%', marginTop: 10, background: 'var(--purple-50)', color: 'var(--purple-700)', border: '1px dashed var(--purple-200, #c4b5fd)', padding: '7px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Auto-assign nearest vacant</button>
          </div>
          <div style={{ background: 'var(--rose-50)', border: '1px solid var(--rose-100, #fecaca)', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--rose-600)', marginBottom: 4 }}>
              <Icon name="alert-triangle" size={13} color="var(--rose-600)" /> 1 broken seat
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>E-7 has a broken monitor. File a service request to Facilities?</div>
            <button style={{ marginTop: 8, background: 'var(--rose-600)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create ticket</button>
          </div>
        </div>
      </div>
    </AdminShellTop>
  );
};

// ─── 4. SECURITY (Scan Activity) ─────────────────────────────────────────────
const SecurityFrame = () => (
  <AdminShellTop active="people">
    <InternsSubnav active="security" />
    <InternsHeader
      title="Attendance Security"
      sub="Triage queue for anomalies — shared devices, off-site scans, after-hours. Full log is secondary."
      secondary={[{ icon: 'file-text', label: 'Open full log' }, { icon: 'settings', label: 'Rules' }]}
      primary={{ icon: 'check-circle', label: 'Resolve all clean' }}
    />

    <KpiStrip items={[
      ['Needs decision', '3', 'Average age 4h', 'var(--rose-600)'],
      ['Auto-cleared today', '142', 'Within policy', 'var(--green-600)'],
      ['Investigated this week', '6', '4 dismissed, 2 actioned', 'var(--ink-900)'],
      ['Active rules', '7', 'Last edited 3d ago', 'var(--purple-700)'],
    ]} />

    <div style={{ background: 'var(--amber-50)', border: '1px solid var(--amber-100, #fde68a)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name="info" size={14} color="var(--amber-600)" />
      <span style={{ fontSize: 12.5, color: 'var(--ink-700)' }}>This queue only shows scans that broke a rule. 99.2% of scans pass automatically — nothing to do for those.</span>
    </div>

    {/* Triage queue */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Triage queue</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {['Needs decision · 3', 'Investigating · 1', 'Resolved · 6'].map((t, i) => (
            <span key={t} style={{ padding: '4px 10px', fontSize: 11.5, fontWeight: 600, borderRadius: 99, background: i === 0 ? 'var(--ink-900)' : 'var(--paper)', color: i === 0 ? '#fff' : 'var(--ink-700)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
      </div>

      {[
        {
          intern: 'Mira Soto', rule: 'Shared device', when: '08:55 today',
          detail: 'Same device fingerprint used by Mark G. at 08:42. Both scans accepted.',
          evidence: ['Device · Chrome 142 / macOS 15.1', 'Network · CSI-Manila-Floor3', 'GPS · 14.55°N 121.05°E (HQ)'],
          severity: 'high',
        },
        {
          intern: 'Daryl Tan', rule: 'Off-site scan', when: '07:18 today',
          detail: 'Time-in scan from coords 14.62°N 121.11°E (~6.4 km from HQ).',
          evidence: ['Device · iPhone 12 / iOS 18.2', 'Network · LTE / Globe', 'GPS · 14.62°N 121.11°E'],
          severity: 'medium',
        },
        {
          intern: 'Tina Lopez', rule: 'After-hours', when: '22:14 last night',
          detail: 'Scan at 10:14 PM. Working hours 8am–7pm. May be legitimate overtime.',
          evidence: ['Device · MacBook Air / macOS 14.5', 'Network · CSI-Manila-Floor3', 'Recent OT request · Yes (#OT-318)'],
          severity: 'low',
        },
      ].map((r, i) => (
        <div key={i} style={{ padding: 16, borderBottom: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{r.intern}</span>
            <span style={{ fontSize: 10.5, padding: '2px 8px', background: r.severity === 'high' ? 'var(--rose-50)' : r.severity === 'medium' ? 'var(--amber-50)' : 'var(--ink-50, #f3f4f6)', color: r.severity === 'high' ? 'var(--rose-600)' : r.severity === 'medium' ? 'var(--amber-600)' : 'var(--ink-700)', borderRadius: 99, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{r.rule}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>· {r.when}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-700)', marginBottom: 10 }}>{r.detail}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {r.evidence.map((e, j) => (
                <span key={j} style={{ fontSize: 11, padding: '3px 9px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99, color: 'var(--ink-700)', fontFamily: e.startsWith('Device') || e.startsWith('GPS') ? 'ui-monospace, monospace' : 'inherit' }}>{e}</span>
              ))}
            </div>
            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', paddingLeft: 8, borderLeft: '1px solid var(--ink-100)' }}>
              <button style={{ background: 'transparent', color: 'var(--rose-600)', border: '1px solid var(--rose-100, #fecaca)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="lock" size={12} color="var(--rose-600)" /> Flag &amp; lock</button>
              <button style={{ background: 'transparent', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="search" size={12} /> Investigate</button>
              <button style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="check" size={12} color="#fff" /> Approve</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <QuickLinks items={[['shield', 'Security rules'], ['file-text', 'Audit log'], ['users', 'Intern roster']]} />
  </AdminShellTop>
);

// ─── 5. PLANNING ──────────────────────────────────────────────────────────────
const PlanningFrame = () => (
  <AdminShellTop active="people">
    <InternsSubnav active="planning" />
    <InternsHeader
      title="Planning"
      sub="Decide when to open intake windows based on capacity, mentor availability, and seasonal demand."
      secondary={[{ icon: 'sliders', label: 'Capacity model' }, { icon: 'history', label: 'Past intakes' }]}
      primary={{ icon: 'megaphone', label: 'Open intake' }}
    />

    <Decision
      verdict="go"
      headline="Open Summer 2026 applications · target 18 interns"
      reasons="Capacity check passed: 22 vacant seats, 4 mentors with bandwidth (avg 5 interns each), incoming hours requests align with school calendar. Risk: Aug saturation if more than 22 admitted."
      cta="Open intake window"
    />

    <KpiStrip items={[
      ['Seats available', '22 / 40', 'Manila HQ Floor 3', 'var(--green-600)'],
      ['Mentors with capacity', '4', '20 intern slots', 'var(--purple-700)'],
      ['Schools tracked', '14', 'UPLB, DLSU, ADMU lead', 'var(--ink-900)'],
      ['Last intake conversion', '76%', 'App → onboarded', 'var(--green-600)'],
    ]} />

    {/* Capacity vs demand */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Capacity vs. expected demand · next 12 months</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-700)' }}>● Capacity</span>
            <span style={{ fontSize: 11, color: 'var(--ink-700)' }}>● Demand (forecast)</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, alignItems: 'end', height: 160 }}>
          {[
            [16, 6], [18, 8], [20, 10], [22, 14], [22, 28], [22, 32],
            [22, 30], [22, 22], [20, 14], [18, 10], [18, 8], [16, 6],
          ].map(([cap, dem], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 130 }}>
                <div style={{ width: 10, height: `${cap * 3.5}px`, background: 'var(--purple-700)', borderRadius: 2 }} />
                <div style={{ width: 10, height: `${dem * 3.5}px`, background: dem > cap ? 'var(--rose-600)' : 'var(--green-600)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink-500)' }}>{'JFMAMJJASOND'[i]}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: 10, background: 'var(--rose-50)', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="alert-triangle" size={13} color="var(--rose-600)" /> <span><b>May–Jul</b>: demand exceeds capacity by 10–18 slots. Consider waitlisting or staggered start dates.</span>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12 }}>Suggested intake windows</div>
        {[
          ['Summer 26', 'May 4 – Jul 25', '18 slots', 'Recommended', 'var(--green-600)'],
          ['Mid-year 26', 'Aug 10 – Oct 17', '8 slots', 'Smaller batch', 'var(--purple-700)'],
          ['Year-end 26', 'Oct 26 – Dec 19', '6 slots', 'Quiet period', 'var(--ink-500)'],
        ].map(([n, dates, slots, badge, c], i) => (
          <div key={n} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{n}</span>
              <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 99, background: c === 'var(--green-600)' ? 'var(--green-50)' : c === 'var(--purple-700)' ? 'var(--purple-50)' : 'var(--ink-50, #f3f4f6)', color: c, fontWeight: 700 }}>{badge}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 3 }}>{dates} · {slots}</div>
            <button style={{ marginTop: 6, background: 'transparent', color: 'var(--purple-700)', border: 'none', padding: 0, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Schedule this window →</button>
          </div>
        ))}
      </div>
    </div>

    {/* Top schools */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12 }}>Conversion by source school (last 4 intakes)</div>
      {[
        ['UP Los Baños', 42, 38, 30],
        ['De La Salle University', 28, 22, 17],
        ['Ateneo de Manila', 24, 18, 12],
        ['FEU Institute of Tech', 16, 12, 8],
        ['Mapúa University', 12, 8, 5],
      ].map(([s, apps, accepted, completed], i) => (
        <div key={s} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 60px', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--ink-100)' : 'none', alignItems: 'center', fontSize: 12.5 }}>
          <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{s}</span>
          <span style={{ color: 'var(--ink-700)' }}>{apps} applied</span>
          <span style={{ color: 'var(--ink-700)' }}>{accepted} accepted</span>
          <span style={{ color: 'var(--ink-700)' }}>{completed} completed</span>
          <span style={{ textAlign: 'right', color: 'var(--green-600)', fontWeight: 700 }}>{Math.round(completed / apps * 100)}%</span>
        </div>
      ))}
    </div>

    <QuickLinks items={[['file-text', 'Applications'], ['users', 'Roster'], ['settings', 'School registry']]} />
  </AdminShellTop>
);

// ─── 6. ATTENDANCE ────────────────────────────────────────────────────────────
const AttendanceFrame = () => (
  <AdminShellTop active="people">
    <InternsSubnav active="attendance" />
    <InternsHeader
      title="Attendance"
      sub="At-risk interns first. Aggregate view available, but the workflow is per-person follow-up."
      secondary={[{ icon: 'download', label: 'Export hours report' }, { icon: 'calendar', label: 'Aggregate view' }]}
      primary={{ icon: 'send', label: 'Send reminders' }}
    />

    <KpiStrip items={[
      ['At-risk interns', '3', 'Under hours or late streak', 'var(--rose-600)'],
      ['On track', '21', 'Of 26 active', 'var(--green-600)'],
      ['Avg attendance', '94.2%', '+1.8 vs. last batch', 'var(--green-600)'],
      ['Hours logged · week', '892', 'Of 1,040 expected', 'var(--ink-900)'],
    ]} />

    {/* At-risk queue */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Needs follow-up · 3</span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Sorted by severity</span>
      </div>

      {[
        ['Daryl Tan', 'Late 4 days in a row', '52 / 80 hrs', '65%', 'rose', 'Auto-warning sent yesterday — no response yet'],
        ['Joel Alvarez', 'Missed 2 days this week', '38 / 80 hrs', '48%', 'rose', 'Mentor flagged a 1:1 for Friday'],
        ['Aiko Mendoza', 'On track for hours, but 5 late check-ins', '74 / 80 hrs', '93%', 'amber', 'Borderline — monitor next week'],
      ].map(([n, issue, hrs, pct, sev, note], i) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '32px 1.6fr 1.4fr 1fr 1fr auto', padding: '14px 16px', borderBottom: i < 2 ? '1px solid var(--ink-100)' : 'none', alignItems: 'center', gap: 10 }}>
          <Avatar initials={n.split(' ').map(x => x[0]).join('')} color={sev === 'rose' ? 'var(--rose-600)' : 'var(--amber-600)'} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{n}</div>
            <div style={{ fontSize: 11.5, color: sev === 'rose' ? 'var(--rose-600)' : 'var(--amber-600)', fontWeight: 600, marginTop: 2 }}>{issue}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-700)' }}>{note}</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)' }}>{hrs}</div>
            <div style={{ height: 6, background: 'var(--ink-50, #f3f4f6)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: pct, height: '100%', background: sev === 'rose' ? 'var(--rose-600)' : 'var(--amber-600)' }} />
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: sev === 'rose' ? 'var(--rose-600)' : 'var(--amber-600)' }}>{pct}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Send reminder</button>
            <button style={{ background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Schedule 1:1</button>
          </div>
        </div>
      ))}
    </div>

    {/* Hours overview */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Daily attendance · this week</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>26 active · expected 5d/wk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
          {['Mon 26', 'Tue 25', 'Wed 24', 'Thu 23', 'Fri'].map((d, i) => {
            const present = [26, 25, 24, 23, 0][i];
            const h = present * 4.5;
            return (
              <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-900)' }}>{present || '—'}</span>
                <div style={{ width: '100%', height: 100, background: 'var(--paper)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                  {present > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: h + 'px', background: present >= 25 ? 'var(--green-600)' : 'var(--amber-600)', borderRadius: 6 }} />}
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 10 }}>Top performers this month</div>
        {[
          ['Mark G. Guerrero', '100%', '80/80 hrs'],
          ['Mira Soto', '97%', '78/80 hrs'],
          ['Tina Lopez', '95%', '76/80 hrs'],
          ['Rina Bautista', '94%', '75/80 hrs'],
        ].map(([n, pct, hrs], i) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1fr 1fr', padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--ink-100)' : 'none', alignItems: 'center', fontSize: 12.5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)' }}>#{i + 1}</span>
            <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{n}</span>
            <span style={{ color: 'var(--green-600)', fontWeight: 700 }}>{pct}</span>
            <span style={{ color: 'var(--ink-700)' }}>{hrs}</span>
          </div>
        ))}
      </div>
    </div>

    <QuickLinks items={[['shield', 'Security review'], ['users', 'Intern roster'], ['file-text', 'Hours report']]} />
  </AdminShellTop>
);

Object.assign(window, {
  InternsInvitesFrame,
  WifiVouchersFrame,
  SeatMapFrame,
  SecurityFrame,
  PlanningFrame,
  AttendanceFrame,
});
