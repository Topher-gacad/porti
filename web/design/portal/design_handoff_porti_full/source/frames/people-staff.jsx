// People · IT Staff and Interns — role-specific management views
// Both lenses read from the same User records (clicking any row → user detail page)

// ──── IT Staff management ─────────────────────────────────────
const itStaff = [
  ['Joan Cabral',   'IT-2024-0142', 'joan.cabral@cornersteel.com', 'ERPNext Engineers',  'Senior Engineer · Project Lead', ['ERPNext','Python','SLA-coach'], 8,  142, 96, 12, 'On call', 'var(--orange-600)'],
  ['Jay Lim',       'IT-2024-0118', 'jay.lim@cornersteel.com',     'Network',            'Network Administrator',          ['Cisco','Firewalls','VPN'],     11, 118, 92, 18, 'Available', 'var(--rose-600)'],
  ['Aldo Reyes',    'IT-2024-0096', 'aldo.r@cornersteel.com',      'Network',            'Network Engineer',               ['PKI','SSL','Linux'],           4,  96,  98, 8,  'Available', '#7c3aed'],
  ['Carl J. Monreal','IT-9262',     'cjmonreal@cornersteel.com',   'System Admin',       'Network Administrator',          ['Windows Server','AD'],         3,  46,  100, 5,  'Available', 'var(--purple-700)'],
  ['Christopher Gacad','IT-9065',   'cgacad@cornersteel.com',      'Development & AI',   'Project Lead',                   ['React','Node','PM'],           6,  88,  100, 8,  'Off-hours', 'var(--blue-600)'],
  ['Christian Jamero','IT-9351',    'ccjamero@cornersteel.com',    'ERPNext Engineers',  'ERPNext Engineer',               ['Frappe','Python'],             2,  31,  90, 1,  'Available', 'var(--green-600)'],
  ['Andrei Buenaventura','IT-9254', 'abuenaventura@cornersteel.com','Electronics',       'Electronics Engineer',           ['Hardware','Robotics'],         1,  24,  100, 0, 'PTO until Fri', 'var(--ink-500)'],
  ['Clarise Duco',  'IT-9251',      'cduco@cornersteel.com',       'ERPNext · Accounting','ERPNext Engineer',              ['ERPNext','Accounting'],        2,  18,  88, 0,  'Available', 'var(--amber-600)'],
];

const PresencePill = ({ status }) => {
  const map = {
    'On call':     ['var(--rose-50)',   'var(--rose-600)',   'var(--rose-600)'],
    'Available':   ['var(--green-50)',  'var(--green-600)',  'var(--green-600)'],
    'Off-hours':   ['var(--ink-50, #f3f4f6)','var(--ink-700)','var(--ink-500)'],
    'PTO until Fri':['var(--amber-50)', 'var(--amber-600)',  'var(--amber-600)'],
  };
  const [bg, col, dot] = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: bg, color: col, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: dot }} /> {status}
    </span>
  );
};

const PeopleITStaffFrame = () => (
  <AdminShellTop active="people">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>People</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>IT support team — workload, performance, on-call status.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="calendar" size={13} /> On-call schedule
        </button>
        <button style={{ ...primaryAdmin }}><Icon name="user-plus" size={13} /> Add IT Staff</button>
      </div>
    </div>

    <PeopleSubnav active="it-staff" />

    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 14 }}>
      <StatTile label="Team size" value="12" />
      <StatTile label="On call now" value="2" color="var(--rose-600)" />
      <StatTile label="Open tickets" value="37" color="var(--purple-700)" />
      <StatTile label="Avg resolution" value="94%" color="var(--green-600)" delta="+2.1pp" />
      <StatTile label="SLA at risk" value="4" color="var(--amber-600)" />
    </div>

    {/* Filter bar */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, height: 36 }}>
        <Icon name="search" size={14} color="var(--ink-500)" />
        <input placeholder="Search by name, employee ID, designation, or skill…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit' }} />
      </div>
      <Chip label="Team" value="All" />
      <Chip label="Skill" value="Any" />
      <Chip label="Presence" value="Any" />
      <Chip label="Sort" value="Workload" active />
    </div>

    {/* Table */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr 1.4fr 0.9fr 1fr 1.1fr 50px', padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', alignItems: 'center', gap: 12 }}>
        <span>Engineer</span>
        <span>Team / Designation</span>
        <span>Skills</span>
        <span style={{ textAlign: 'center' }}>Workload</span>
        <span style={{ textAlign: 'center' }}>Resolution</span>
        <span>Presence</span>
        <span></span>
      </div>
      {itStaff.map(([n, eid, em, team, desig, skills, openT, totalT, resol, slaRisk, presence, color], i) => {
        const loadPct = Math.min(100, (openT / 12) * 100);
        const loadColor = openT >= 9 ? 'var(--rose-600)' : openT >= 5 ? 'var(--amber-600)' : 'var(--green-600)';
        return (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr 1.4fr 0.9fr 1fr 1.1fr 50px', padding: '13px 16px', borderBottom: i < itStaff.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar initials={n.split(' ').map(x => x[0]).join('').slice(0, 2)} color={color} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{eid} · {em}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{team}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{desig}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.slice(0, 2).map(s => (
                <span key={s} style={{ fontSize: 10.5, padding: '2px 7px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99, color: 'var(--ink-700)', fontWeight: 600 }}>{s}</span>
              ))}
              {skills.length > 2 && <span style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600 }}>+{skills.length - 2}</span>}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: loadColor, fontVariantNumeric: 'tabular-nums' }}>{openT}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>/{totalT}</span>
              </div>
              <div style={{ height: 4, background: 'var(--ink-50, #f3f4f6)', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ height: '100%', width: loadPct + '%', background: loadColor }} />
              </div>
              {slaRisk > 0 && <div style={{ fontSize: 10, color: 'var(--rose-600)', textAlign: 'center', marginTop: 2, fontWeight: 600 }}>{slaRisk} at risk</div>}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: resol >= 95 ? 'var(--green-600)' : resol >= 85 ? 'var(--ink-900)' : 'var(--amber-600)', fontVariantNumeric: 'tabular-nums' }}>{resol}%</span>
            </div>
            <PresencePill status={presence} />
            <Icon name="more-horizontal" size={15} color="var(--ink-500)" />
          </div>
        );
      })}
    </div>
  </AdminShellTop>
);

// ──── Intern management ──────────────────────────────────────
const interns = [
  ['Patrick Julian D. Concepcion', 'patrick.concepcion201@gmail.com', 'Mapua University', '05/05–06/15', 24, 240, 'None', 'Active', '—', 'var(--purple-700)'],
  ['Nikolas Tadeo Templo Aquino',  'nikolsghwork@gmail.com',         'De La Salle CSB',  '04/13–05/15', 28.5, 300, 'None', 'Active', '—', 'var(--rose-600)'],
  ['Ashley Magbanua',              'ashleymagbanua11@gmail.com',     'PUP',              '03/30–05/22', 163.6, 300, 'Robotics R&D', 'Active', 'Present', 'var(--orange-600)'],
  ['Aeron Justine Sol',            'arnjstnsol@gmail.com',           'PUP',              '03/30–05/19', 171.5, 300, 'Robotics R&D', 'Active', 'Present', 'var(--blue-600)'],
  ['Ciara Joy M. Abong',           'abongciarajoy@gmail.com',        'PUP',              '03/30–05/19', 171.2, 300, 'Frontend',     'Active', 'Present', 'var(--green-600)'],
  ['Carl Heinz Paloma',            'heinz.paloma@gmail.com',         'Rizal Tech U.',    '03/16–05/26', 142.4, 300, 'QA & Testing', 'Active', 'Present', '#7c3aed'],
  ['Mark Gerald V. Guerrero',      'mark.g@cornersteel.com',         'Mapua University', '01/15–04/28', 480,   480, 'Robotics R&D', 'Completed', '—', 'var(--ink-500)'],
  ['Mira Soto',                    'mira.soto@cornersteel.com',      'PUP',              '01/15–05/30', 312,   480, 'Frontend',     'Active', 'Late', 'var(--amber-600)'],
];

const InternToolChip = ({ icon, label, count }) => (
  <button style={{ background: 'var(--card)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
    <Icon name={icon} size={13} color="var(--purple-700)" /> {label}
    {count != null && <span style={{ fontSize: 10.5, padding: '1px 6px', background: 'var(--paper)', borderRadius: 99, color: 'var(--ink-500)', fontWeight: 700 }}>{count}</span>}
  </button>
);

const TodayPill = ({ status }) => {
  if (status === '—') return <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>—</span>;
  const map = {
    Present: ['var(--green-50)', 'var(--green-600)'],
    Late:    ['var(--amber-50)', 'var(--amber-600)'],
    Absent:  ['var(--rose-50)',  'var(--rose-600)'],
  };
  const [bg, col] = map[status];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, background: bg, color: col, fontSize: 11, fontWeight: 700 }}>
    <span style={{ width: 5, height: 5, borderRadius: 99, background: col }} /> {status}
  </span>;
};

const PeopleInternsFrame = () => (
  <AdminShellTop active="people">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink-900)' }}>People</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>Internship program — registrations, attendance, hours, evaluations.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="download" size={13} /> Export DTR
        </button>
        <button style={{ ...primaryAdmin }}><Icon name="user-plus" size={13} /> Onboard intern</button>
      </div>
    </div>

    <PeopleSubnav active="interns" />

    {/* Stats — 5 tiles per the original */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 14 }}>
      <StatTile label="Total interns" value="65" />
      <StatTile label="Active" value="26" color="var(--green-600)" />
      <StatTile label="Present today" value="20" color="var(--purple-700)" />
      <StatTile label="Completed" value="37" color="var(--ink-700)" />
      <StatTile label="Seats" value="19/76" color="var(--amber-600)" />
    </div>

    {/* Tools toolbar — these belong here, not the master Users page */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>Program tools</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <InternToolChip icon="key" label="Invite Codes" count={8} />
        <InternToolChip icon="wifi" label="WiFi Vouchers" count={42} />
        <InternToolChip icon="book-open" label="Schools & Courses" count={11} />
        <InternToolChip icon="grid" label="Seat Map" />
        <InternToolChip icon="camera" label="Selfie Review" count={3} />
        <InternToolChip icon="activity" label="Scan Activity" />
        <InternToolChip icon="trophy" label="Leaderboard" />
        <InternToolChip icon="check-square" label="Attendance" />
        <InternToolChip icon="calendar" label="Planning" />
      </div>
    </div>

    {/* Filter bar */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 8, height: 36 }}>
        <Icon name="search" size={14} color="var(--ink-500)" />
        <input placeholder="Search by name, email, school, or supervisor…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit' }} />
      </div>
      <Chip label="Period" value="All" />
      <Chip label="School" value="Any" />
      <Chip label="Plan" value="Any" />
      <Chip label="Status" value="Active" count={26} active />
    </div>

    {/* Table */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1fr 1.5fr 1fr 1fr 0.9fr 50px', padding: '11px 16px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', background: 'var(--paper)', alignItems: 'center', gap: 12 }}>
        <span>Intern</span>
        <span>School</span>
        <span>Period</span>
        <span>Hours logged</span>
        <span>Plan</span>
        <span>Status</span>
        <span>Today</span>
        <span></span>
      </div>
      {interns.map(([n, em, sch, per, h, total, plan, status, today, color], i) => {
        const pct = Math.min(100, (h / total) * 100);
        return (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1fr 1.5fr 1fr 1fr 0.9fr 50px', padding: '13px 16px', borderBottom: i < interns.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, color: 'var(--ink-700)', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar initials={n.split(' ').map(x => x[0]).join('').slice(0, 2)} color={color} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{em}</div>
              </div>
            </div>
            <span style={{ fontSize: 12 }}>{sch}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-500)', fontVariantNumeric: 'tabular-nums' }}>{per}</span>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ fontWeight: 700, color: 'var(--ink-900)', fontVariantNumeric: 'tabular-nums' }}>{h} h</span>
                <span style={{ color: 'var(--ink-500)' }}>of {total} h</span>
              </div>
              <div style={{ height: 5, background: 'var(--ink-50, #f3f4f6)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? 'var(--green-600)' : pct >= 60 ? 'var(--purple-700)' : pct >= 20 ? 'var(--blue-600)' : 'var(--amber-600)' }} />
              </div>
            </div>
            <span style={{ fontSize: 11.5, padding: '3px 9px', background: plan === 'None' ? 'var(--ink-50, #f3f4f6)' : 'var(--purple-50)', color: plan === 'None' ? 'var(--ink-500)' : 'var(--purple-700)', borderRadius: 99, fontWeight: 600, justifySelf: 'start' }}>{plan}</span>
            <StatusPill status={status === 'Completed' ? 'Active' : status} />
            <TodayPill status={today} />
            <Icon name="more-horizontal" size={15} color="var(--ink-500)" />
          </div>
        );
      })}
    </div>
  </AdminShellTop>
);

window.PeopleITStaffFrame = PeopleITStaffFrame;
window.PeopleInternsFrame = PeopleInternsFrame;
