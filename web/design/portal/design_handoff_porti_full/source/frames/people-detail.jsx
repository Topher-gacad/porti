// People · User detail — profile, scope, permissions matrix
const modules = [
  ['dashboard', 'Dashboard', 'Home, summary widgets', [1,0,0,0,0]],
  ['services', 'Service Catalog', 'Browse and request services', [1,1,1,0,0]],
  ['requests', 'Requests', 'Tickets queue + ticket details', [1,1,1,1,1]],
  ['my-requests', 'My Requests', 'Submitted by me', [1,1,1,0,0]],
  ['kb', 'Knowledge Base', 'Articles, runbooks', [1,1,1,0,0]],
  ['board', 'Community Board', 'Posts, comments, reactions', [1,1,1,0,0]],
  ['people', 'People', 'User & role management', [1,0,0,0,0]],
  ['insights', 'Insights & Reports', 'Analytics, dashboards', [1,0,0,0,0]],
  ['settings', 'System Settings', 'Org, branding, integrations', [0,0,0,0,0]],
  ['billing', 'Billing & Licenses', 'Subscriptions, invoices', [0,0,0,0,0]],
];

const PermCell = ({ on, inherited, locked }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 22, height: 22, borderRadius: 6,
      background: locked ? 'var(--ink-50, #f3f4f6)' : on ? (inherited ? 'var(--purple-50)' : 'var(--purple-700)') : 'var(--card)',
      border: '1px solid ' + (on ? (inherited ? 'var(--purple-200, #c4b5fd)' : 'var(--purple-700)') : 'var(--ink-200)'),
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: locked ? 'not-allowed' : 'pointer',
      opacity: locked ? 0.5 : 1,
    }}>
      {on && <Icon name="check" size={12} color={inherited ? 'var(--purple-700)' : '#fff'} />}
      {locked && <Icon name="lock" size={10} color="var(--ink-500)" />}
    </div>
  </div>
);

const InfoRow = ({ label, children, edit }) => (
  <div style={{ padding: '12px 0', borderBottom: '1px solid var(--ink-100)', display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{label}</span>
    <div style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 500 }}>{children}</div>
    {edit !== false && <Icon name="edit-2" size={12} color="var(--ink-500)" />}
  </div>
);

const PermLegend = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--ink-500)' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--purple-700)' }} /> Direct
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--purple-50)', border: '1px solid var(--purple-200, #c4b5fd)' }} /> Inherited from role
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--ink-50, #f3f4f6)', border: '1px solid var(--ink-200)' }} /> Not available
    </span>
  </div>
);

const PeopleUserDetailFrame = () => (
  <AdminShellTop active="people">
    {/* Breadcrumb */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>
      <span style={{ cursor: 'pointer' }}>People</span>
      <Icon name="chevron-right" size={11} />
      <span style={{ cursor: 'pointer' }}>Users</span>
      <Icon name="chevron-right" size={11} />
      <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>Joan Cabral</span>
    </div>

    {/* Header card */}
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: 'var(--orange-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flex: '0 0 auto', position: 'relative' }}>
        JC
        <span style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 99, background: 'var(--green-600)', border: '2px solid var(--card)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.5 }}>Joan Cabral</span>
          <StatusPill status="Active" />
          <RoleBadge role="IT Staff" />
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="mail" size={12} /> joan.cabral@cornersteel.com</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="phone" size={12} /> +63 917 555 0142</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="map-pin" size={12} /> Manila HQ · 3rd Floor</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={12} /> Online now</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="key" size={13} /> Reset password
        </button>
        <button style={{ background: 'var(--card)', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="message-circle" size={13} /> Message
        </button>
        <button style={{ ...primaryAdmin }}><Icon name="edit-2" size={13} /> Edit profile</button>
        <button style={{ background: 'var(--card)', color: 'var(--ink-500)', border: '1px solid var(--ink-200)', padding: '8px 10px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer' }}>
          <Icon name="more-horizontal" size={13} />
        </button>
      </div>
    </div>

    {/* Tabs */}
    <div style={{ borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 4, marginBottom: 16 }}>
      {['Overview', 'Access & Permissions', 'Activity', 'Devices & Sessions', 'Audit log'].map((t, i) => (
        <span key={t} style={{
          padding: '9px 14px', fontSize: 13, fontWeight: i === 1 ? 700 : 500,
          color: i === 1 ? 'var(--purple-700)' : 'var(--ink-700)',
          borderBottom: i === 1 ? '2px solid var(--purple-700)' : '2px solid transparent',
          marginBottom: -1, cursor: 'pointer',
        }}>{t}</span>
      ))}
    </div>

    {/* Two-col body */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
      <div>
        {/* Scope card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Scope</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>Where in the org this user operates. All permissions below are evaluated within this scope.</div>
            </div>
            <button style={{ background: 'transparent', color: 'var(--purple-700)', border: '1px solid var(--purple-200, #c4b5fd)', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add scope</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              ['building', 'Company', 'Cornersteel Inc.', 'All branches'],
              ['git-branch', 'Branch', 'Manila HQ', '+2 more'],
              ['users', 'Department', 'IT Support', 'Member'],
            ].map(([ic, l, v, sub]) => (
              <div key={l} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 5 }}>
                  <Icon name={ic} size={11} color="var(--ink-500)" /> {l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>{v}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Assigned roles</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>Roles bundle permissions. The matrix below shows the merged result, with overrides applied.</div>
            </div>
            <button style={{ background: 'transparent', color: 'var(--purple-700)', border: '1px solid var(--purple-200, #c4b5fd)', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Manage roles</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['IT Staff', 'Default for support team', 'var(--purple-700)'],
              ['Knowledge Author', 'Custom · 4 users', 'var(--green-600)'],
              ['On-call · Tier 2', 'Time-bound · until Jun 30', 'var(--amber-600)'],
            ].map(([r, sub, c]) => (
              <div key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px 7px 7px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, background: c, color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={11} color="#fff" /></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>{r}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>· {sub}</span>
                <Icon name="x" size={11} color="var(--ink-500)" />
              </div>
            ))}
          </div>
        </div>

        {/* Permissions matrix */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 18, borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}>Module permissions</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>What this user can do per module. Toggle to override role defaults — direct overrides win.</div>
            </div>
            <PermLegend />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr repeat(5, 80px) 70px', padding: '10px 18px', borderBottom: '1px solid var(--ink-100)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--paper)' }}>
            <span>Module</span>
            <span style={{ textAlign: 'center' }}>View</span>
            <span style={{ textAlign: 'center' }}>Create</span>
            <span style={{ textAlign: 'center' }}>Update</span>
            <span style={{ textAlign: 'center' }}>Delete</span>
            <span style={{ textAlign: 'center' }}>Approve</span>
            <span style={{ textAlign: 'right' }}>Source</span>
          </div>

          {modules.map(([id, name, desc, perms], i) => {
            const [v, c, u, d, a] = perms;
            const sources = ['IT Staff', 'IT Staff', 'IT Staff', 'IT Staff', 'IT Staff', 'IT Staff', 'IT Staff', 'IT Staff', '—', '—'];
            const direct = id === 'kb'; // mark KB as having direct overrides
            const locked = id === 'billing';
            return (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: '2.4fr repeat(5, 80px) 70px', padding: '12px 18px', borderBottom: i < modules.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: 12.5, alignItems: 'center', background: direct ? 'var(--purple-50)' : 'transparent' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {name}
                    {direct && <span style={{ fontSize: 9.5, padding: '1px 6px', background: 'var(--purple-700)', color: '#fff', borderRadius: 99, fontWeight: 700, letterSpacing: 0.3 }}>OVERRIDE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{desc}</div>
                </div>
                <PermCell on={v} inherited={!direct} locked={locked} />
                <PermCell on={c} inherited={!direct} locked={locked} />
                <PermCell on={u} inherited={!direct} locked={locked} />
                <PermCell on={d} inherited={!direct} locked={locked} />
                <PermCell on={a} inherited={!direct} locked={locked} />
                <span style={{ textAlign: 'right', fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 600 }}>{direct ? 'Direct' : sources[i]}</span>
              </div>
            );
          })}

          <div style={{ padding: '12px 18px', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)' }}>
            <span>Effective permissions auto-recompute when roles change. Last recomputed 2 minutes ago.</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ background: 'transparent', border: '1px solid var(--ink-200)', color: 'var(--ink-700)', padding: '5px 11px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Reset to role defaults</button>
              <button style={{ background: 'var(--ink-900)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save changes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>Account</div>
          <InfoRow label="User ID" edit={false}>USR-00142</InfoRow>
          <InfoRow label="Employee ID">CSI-2024-0142</InfoRow>
          <InfoRow label="Manager">Topepe Cruz</InfoRow>
          <InfoRow label="Joined">Nov 2, 2024</InfoRow>
          <InfoRow label="Last password reset" edit={false}>14 days ago</InfoRow>
          <InfoRow label="2FA" edit={false}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--green-600)', fontWeight: 700 }}>
              <Icon name="shield-check" size={12} color="var(--green-600)" /> Authenticator
            </span>
          </InfoRow>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>Access summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['8', 'modules', 'var(--purple-700)'],
              ['32', 'permissions', 'var(--ink-900)'],
              ['1', 'override', 'var(--orange-600)'],
              ['142', 'tickets handled', 'var(--green-600)'],
            ].map(([v, l, c]) => (
              <div key={l} style={{ background: 'var(--paper)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: c, letterSpacing: -0.3 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Recent permission changes</span>
          </div>
          {[
            ['Knowledge Base · Update', 'enabled (override)', 'You', '2m ago', 'var(--green-600)'],
            ['On-call · Tier 2 role', 'assigned, exp. Jun 30', 'You', '2h ago', 'var(--purple-700)'],
            ['Branch scope', 'added "Cebu"', 'Topepe Cruz', '3d ago', 'var(--ink-700)'],
            ['Settings · View', 'removed', 'System', 'Apr 12', 'var(--rose-600)'],
          ].map(([what, change, by, time, c], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--ink-100)' : 'none' }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: c, marginTop: 6, flex: '0 0 auto' }} />
              <div style={{ fontSize: 12, flex: 1 }}>
                <div style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{what}</div>
                <div style={{ color: 'var(--ink-500)', marginTop: 1 }}>{change}</div>
                <div style={{ color: 'var(--ink-500)', marginTop: 3, fontSize: 11 }}>by {by} · {time}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>View full audit log →</span>
          </div>
        </div>
      </div>
    </div>
  </AdminShellTop>
);

window.PeopleUserDetailFrame = PeopleUserDetailFrame;
