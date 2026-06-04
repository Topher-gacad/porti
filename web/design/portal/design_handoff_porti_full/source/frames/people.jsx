// People · Users — admin user management
const peopleNav = [
  ['users', 'Users', 247, true],
  ['it-staff', 'IT Staff', 12],
  ['interns', 'Interns', 8],
  ['leave', 'Leave Requests', 4],
  ['overtime', 'Overtime', 6],
  ['applications', 'Applications', 11],
  ['admin', 'Admin Accounts', 5],
];

const PeopleSubnav = ({ active = 'users' }) => (
  <div style={{ borderBottom: '1px solid var(--ink-100)', marginBottom: 18, display: 'flex', gap: 4, paddingBottom: 0 }}>
    {peopleNav.map(([id, l, n]) => (
      <a key={id} style={{
        padding: '10px 14px', fontSize: 13, fontWeight: id === active ? 700 : 500,
        color: id === active ? 'var(--purple-700)' : 'var(--ink-700)',
        borderBottom: id === active ? '2px solid var(--purple-700)' : '2px solid transparent',
        marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        {l}
        <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 99, background: id === active ? 'var(--purple-50)' : 'var(--ink-50, #f3f4f6)', color: id === active ? 'var(--purple-700)' : 'var(--ink-500)', fontWeight: 700 }}>{n}</span>
      </a>
    ))}
  </div>
);

const StatTile = ({ label, value, delta, color = 'var(--ink-900)' }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: -0.6 }}>{value}</span>
      {delta && <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>{delta}</span>}
    </div>
  </div>
);

const Chip = ({ label, value, count, active }) => (
  <button style={{
    background: active ? 'var(--ink-900)' : 'var(--card)', color: active ? '#fff' : 'var(--ink-700)',
    border: '1px solid ' + (active ? 'var(--ink-900)' : 'var(--ink-200)'),
    padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
  }}>
    {label} {value && <span style={{ color: active ? '#fff' : 'var(--ink-900)', fontWeight: 700 }}>{value}</span>}
    {count != null && <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 99, background: active ? 'rgba(255,255,255,.2)' : 'var(--ink-50, #f3f4f6)', fontWeight: 700 }}>{count}</span>}
    <Icon name="chevron-down" size={11} />
  </button>
);

const StatusPill = ({ status }) => {
  const map = {
    Active: ['var(--green-50)', 'var(--green-600)', 'var(--green-600)'],
    Pending: ['var(--amber-50)', 'var(--amber-600)', 'var(--amber-600)'],
    Suspended: ['var(--rose-50)', 'var(--rose-600)', 'var(--rose-600)'],
    Invited: ['var(--purple-50)', 'var(--purple-700)', 'var(--purple-700)'],
  };
  const [bg, col, dot] = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, background: bg, color: col, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: dot }} /> {status}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const map = {
    Admin: ['#312e81', '#fff'],
    'IT Staff': ['var(--purple-50)', 'var(--purple-700)'],
    Intern: ['var(--amber-50)', 'var(--amber-600)'],
    Member: ['var(--ink-50, #f3f4f6)', 'var(--ink-700)'],
  };
  const [bg, col] = map[role] || map.Member;
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', background: bg, color: col, borderRadius: 99, letterSpacing: 0.3 }}>{role}</span>;
};

const Avatar = ({ initials, color }) => (
  <div style={{ width: 32, height: 32, borderRadius: 99, background: color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flex: '0 0 auto' }}>{initials}</div>
);

const users = [
  ['Jonathan Peol', 'johnpeol@cornersteel.com', 'Facilities', 'Member', 8, 'Active', '2026-02-16', '5m ago', 'var(--purple-700)'],
  ['Joan Cabral', 'joan.cabral@cornersteel.com', 'IT Support', 'IT Staff', 142, 'Active', '2024-11-02', 'Online', 'var(--orange-600)'],
  ['Jay Lim', 'jay.lim@cornersteel.com', 'IT Support', 'IT Staff', 118, 'Active', '2025-01-08', 'Online', 'var(--rose-600)'],
  ['Mark Gerald V. Guerrero', 'mark.g@cornersteel.com', 'Robotics · Intern', 'Intern', 23, 'Active', '2026-01-15', '12m ago', 'var(--blue-600)'],
  ['Mira Soto', 'mira.soto@cornersteel.com', 'Robotics · Intern', 'Intern', 14, 'Active', '2026-01-15', '1h ago', 'var(--green-600)'],
  ['Aldo Reyes', 'aldo.r@cornersteel.com', 'Network', 'IT Staff', 96, 'Active', '2024-08-22', '3m ago', '#7c3aed'],
  ['Topepe Cruz', 'topepe.itadmin@cornersteel.com', 'IT', 'Admin', 312, 'Active', '2024-03-04', 'Online', '#312e81'],
  ['Ramon Dela Cruz', 'ramon.d@cornersteel.com', 'Logistics', 'Member', 12, 'Pending', '2026-04-20', '—', 'var(--ink-500)'],
  ['Elena Marquez', 'elena.m@cornersteel.com', 'Finance', 'Member', 4, 'Invited', '—', 'never', 'var(--amber-600)'],
  ['Carlo Bayani', 'carlo.b@cornersteel.com', 'Sales', 'Member', 2, 'Suspended', '2025-09-12', '14d ago', 'var(--rose-600)'],
];

const PeopleUsersFrame = () => (
  <AdminShellTop active="people">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>People</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>Manage everyone with access to the IT portal — accounts, roles, and activity.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="upload" size={13} /> Import CSV
        </button>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="download" size={13} /> Export
        </button>
        <button style={{ ...primaryAdmin }}><Icon name="user-plus" size={13} /> Invite user</button>
      </div>
    </div>

    <PeopleSubnav active="users" />

    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
      <StatTile label="Total users" value="247" delta="+12 this month" />
      <StatTile label="Active" value="231" color="var(--green-600)" />
      <StatTile label="Pending invites" value="9" color="var(--amber-600)" />
      <StatTile label="Suspended" value="7" color="var(--rose-600)" />
    </div>

    {/* Search + filter chips */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, height: 36 }}>
        <Icon name="search" size={14} color="var(--ink-500)" />
        <input placeholder="Search by name, email, department, or role…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-700)', fontFamily: 'inherit' }} />
        <span style={{ fontSize: 10.5, padding: '2px 6px', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 4, color: 'var(--ink-500)', fontWeight: 600 }}>⌘K</span>
      </div>
      <Chip label="Role" value="All" />
      <Chip label="Department" value="All" />
      <Chip label="Status" value="Active" count={231} active />
      <Chip label="Joined" value="Anytime" />
    </div>

    {/* Bulk-action bar */}
    <div style={{ background: 'var(--purple-50)', border: '1px solid var(--purple-100, #ddd6fe)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <Icon name="check-square" size={14} color="var(--purple-700)" />
      <span style={{ fontSize: 12.5, color: 'var(--purple-700)', fontWeight: 600 }}>2 users selected</span>
      <span style={{ flex: 1 }} />
      <button style={{ background: 'transparent', border: '1px solid var(--purple-700)', color: 'var(--purple-700)', padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Change role</button>
      <button style={{ background: 'transparent', border: '1px solid var(--purple-700)', color: 'var(--purple-700)', padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Reassign dept.</button>
      <button style={{ background: 'transparent', border: '1px solid var(--rose-600)', color: 'var(--rose-600)', padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Suspend</button>
      <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-500)', padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Clear</button>
    </div>

    {/* Table */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '38px 2.4fr 1.4fr 1fr 0.8fr 1fr 1fr 50px', padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', alignItems: 'center', gap: 12 }}>
        <input type="checkbox" />
        <span>User</span>
        <span>Department</span>
        <span>Role</span>
        <span style={{ textAlign: 'right' }}>Requests</span>
        <span>Status</span>
        <span>Last active</span>
        <span></span>
      </div>
      {users.map(([n, e, d, r, req, s, joined, active, color], i) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '38px 2.4fr 1.4fr 1fr 0.8fr 1fr 1fr 50px', padding: '13px 16px', borderBottom: i < users.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12, background: i === 1 || i === 2 ? 'var(--purple-50)' : 'transparent' }}>
          <input type="checkbox" defaultChecked={i === 1 || i === 2} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar initials={n.split(' ').map(x => x[0]).join('').slice(0, 2)} color={color} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e}</div>
            </div>
          </div>
          <span>{d}</span>
          <RoleBadge role={r} />
          <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums' }}>{req}</span>
          <StatusPill status={s} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {active === 'Online' && <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--green-600)' }} />}
            <span>{active}</span>
          </span>
          <Icon name="more-horizontal" size={15} color="var(--ink-500)" />
        </div>
      ))}
      <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', background: 'var(--paper)' }}>
        <span>Showing 1–10 of 247 users</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 8px', fontSize: 11.5, color: 'var(--ink-500)', cursor: 'pointer', fontFamily: 'inherit' }}>← Prev</button>
          {['1', '2', '3', '…', '25'].map((p, i) => (
            <button key={i} style={{ background: i === 0 ? 'var(--ink-900)' : 'var(--card)', color: i === 0 ? '#fff' : 'var(--ink-700)', border: '1px solid ' + (i === 0 ? 'var(--ink-900)' : 'var(--ink-200)'), borderRadius: 6, padding: '4px 9px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', minWidth: 26 }}>{p}</button>
          ))}
          <button style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 6, padding: '4px 8px', fontSize: 11.5, color: 'var(--ink-700)', cursor: 'pointer', fontFamily: 'inherit' }}>Next →</button>
        </div>
      </div>
    </div>
  </AdminShellTop>
);

window.PeopleUsersFrame = PeopleUsersFrame;
