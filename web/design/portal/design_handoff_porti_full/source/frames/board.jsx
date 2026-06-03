// Community Board — feed-style redesign + post detail view
// Internal social: milestones, achievements, events, memes, announcements, Q&A

const cats = [
  ['all', 'grid', 'All', 'var(--ink-700)', 56],
  ['announce', 'megaphone', 'Announcements', 'var(--rose-600)', 8, true],
  ['kudos', 'award', 'Kudos & Shoutouts', 'var(--orange-600)', 12],
  ['events', 'calendar', 'Events', 'var(--purple-700)', 4],
  ['team', 'users', 'Team Updates', 'var(--blue-600)', 14],
  ['tech', 'code', 'Tech Talk', 'var(--green-600)', 9],
  ['help', 'help-circle', 'Help & Questions', 'var(--amber-600)', 6],
  ['ideas', 'zap', 'Ideas & Suggestions', '#7c3aed', 5],
  ['fun', 'smile', 'Random & Fun', '#db2777', 11],
  ['intern', 'briefcase', 'Intern Corner', 'var(--ink-500)', 7],
];

const BoardShell = ({ children, height = 1200 }) => (
  <AdminShellTop active="board">{children}</AdminShellTop>
);

const BoardSidebar = () => (
  <aside style={{ width: 220, flex: '0 0 auto' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Categories</div>
      {cats.map(([id, ic, l, c, n, active]) => (
        <a key={id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
          background: active ? 'var(--purple-50)' : 'transparent',
          color: active ? 'var(--purple-700)' : 'var(--ink-700)',
          fontSize: 12.5, fontWeight: active ? 600 : 500, cursor: 'pointer', marginBottom: 1,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: c }} />
          <span style={{ flex: 1 }}>{l}</span>
          <span style={{ fontSize: 10.5, color: active ? 'var(--purple-700)' : 'var(--ink-500)', fontWeight: 600 }}>{n}</span>
        </a>
      ))}
    </div>
    <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Trending tags</div>
      {[['#hackathon', 24], ['#newhire', 18], ['#robotics', 12], ['#townhall', 9], ['#friday', 7]].map(([t, n]) => (
        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: 12, color: 'var(--ink-700)', cursor: 'pointer' }}>
          <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>{t}</span>
          <span style={{ color: 'var(--ink-500)' }}>{n}</span>
        </div>
      ))}
    </div>
  </aside>
);

const Composer = () => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 auto' }}>TC</div>
    <div style={{ flex: 1, padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 99, fontSize: 13, color: 'var(--ink-500)', cursor: 'pointer' }}>What's on your mind, Topepe?</div>
    <div style={{ display: 'flex', gap: 4 }}>
      {[['image', 'Photo'], ['award', 'Kudos'], ['calendar', 'Event'], ['help-circle', 'Question']].map(([ic, l]) => (
        <button key={l} style={{ background: 'transparent', border: 'none', padding: '8px 10px', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)', fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name={ic} size={13} color="var(--purple-700)" /> {l}
        </button>
      ))}
    </div>
  </div>
);

const Reactions = ({ emojis, count = 5, comments = 4 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--ink-100)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'inline-flex' }}>
        {emojis.map((e, i) => (
          <span key={i} style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--card)', border: '2px solid var(--card)', boxShadow: '0 0 0 1px var(--ink-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: i > 0 ? -6 : 0, position: 'relative', zIndex: emojis.length - i }}>{e}</span>
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 6 }}>{count}</span>
    </div>
    <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
      {[['heart', 'React'], ['message-circle', `${comments}`], ['share-2', 'Share'], ['bookmark', null]].map(([ic, l]) => (
        <button key={ic} style={{ background: 'transparent', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 12, color: 'var(--ink-700)', fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <Icon name={ic} size={13} color="var(--ink-700)" /> {l}
        </button>
      ))}
    </span>
  </div>
);

const Author = ({ initials, name, role, time, accent, pinned, category }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
    <div style={{ width: 38, height: 38, borderRadius: 99, background: accent || 'var(--purple-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 auto' }}>{initials}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>{name}</span>
        {role && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 7px', background: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: 99, letterSpacing: 0.4 }}>{role}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1 }}>
        <span>{time}</span>
        {category && <><span>·</span><span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>{category}</span></>}
        {pinned && <><span>·</span><span style={{ color: 'var(--rose-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="bookmark" size={10} /> Pinned</span></>}
      </div>
    </div>
    <Icon name="more-horizontal" size={15} color="var(--ink-500)" />
  </div>
);

// ──── Feed view ────────────────────────────────────────────
const CommunityBoardFeedFrame = () => (
  <BoardShell>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink-900)' }}>Community Board</div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>What the team's celebrating, building, asking, and goofing off about today.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'inline-flex', background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 9, padding: 3 }}>
          {['Recent', 'Top', 'For you'].map((p, i) => (
            <span key={p} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: i === 2 ? 'var(--ink-900)' : 'transparent', color: i === 2 ? '#fff' : 'var(--ink-700)' }}>{p}</span>
          ))}
        </div>
        <button style={{ ...primaryAdmin }}><Icon name="plus" size={13} /> New post</button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 14 }}>
      <BoardSidebar />

      {/* Feed column */}
      <div>
        <Composer />

        {/* PINNED — Announcement */}
        <div style={{ background: 'var(--card)', border: '2px solid var(--purple-700)', borderRadius: 14, padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 14px', background: 'var(--purple-700)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, borderRadius: '0 12px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bookmark" size={11} color="#fff" /> ANNOUNCEMENT · PINNED</div>
          <Author initials="HR" name="People Team" role="HR" time="2 hours ago" accent="var(--rose-600)" category="Announcements" />
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.4, marginBottom: 6 }}>Q2 All-hands · May 15, 3:00 PM</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.55, marginBottom: 12 }}>
            We'll cover the H1 roadmap, celebrate Q1 wins (looking at you, Robotics), and welcome our 3 new hires. Refreshments on us. <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>#townhall</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'var(--purple-700)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>RSVP · Attending (47)</button>
            <button style={{ background: 'transparent', color: 'var(--ink-700)', border: '1px solid var(--ink-200)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add to calendar</button>
          </div>
          <Reactions emojis={['👏', '🎉', '🔥']} count={47} comments={12} />
        </div>

        {/* KUDOS card */}
        <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', border: '1px solid var(--amber-100, #fcd34d)', borderRadius: 14, padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: .12 }}>🏆</div>
          <Author initials="JL" name="Jay Lim" role="IT Support" time="5 hours ago" accent="var(--orange-600)" category="Kudos & Shoutouts" />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--orange-600)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="award" size={12} color="var(--orange-600)" /> Kudos to</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.3, marginBottom: 8 }}>@joan.cabral and @aldo.reyes</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.55 }}>
            For pulling an emergency switch swap last night that kept the warehouse running. The kind of teamwork that makes Mondays bearable. 🙏
          </div>
          <Reactions emojis={['🙌', '❤️', '🔥', '👏']} count={31} comments={8} />
        </div>

        {/* ROBOTICS post — image grid (the example from the screenshot) */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <Author initials="MG" name="Mark Gerald V. Guerrero" role="Intern" time="Apr 28" accent="var(--purple-700)" category="Team Updates" />
          <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: -0.3, marginBottom: 6 }}>Final Mission Update — "My battery is getting low and it's getting dark"</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.55, marginBottom: 12 }}>
            Capt. Log #2: Yo yo yo, Captain here from the Robotics Division! This will be our last update. We've successfully mapped the whole IT floor, from the pantry to Sir Jun's office. 🛰️
            <br /><br />
            Thank you for the environment that nurtured us, and for the mentors who are approachable and exceptional at what they do.
          </div>
          {/* Mosaic */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '180px 140px', gap: 4, borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ gridRow: 'span 2', background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🤖</div>
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🗺️</div>
            <div style={{ background: 'linear-gradient(135deg, #422006 0%, #78350f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🔧</div>
            <div style={{ background: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>💻</div>
            <div style={{ background: 'linear-gradient(135deg, #292524 0%, #44403c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative' }}>
              📷
              <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>+2</span>
            </div>
          </div>
          <Reactions emojis={['🚀', '👏', '🤖', '❤️']} count={23} comments={4} />
        </div>

        {/* QUESTION — Help post */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <Author initials="MS" name="Mira Soto" role="Intern" time="6 hours ago" accent="var(--ink-700)" category="Help & Questions" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'var(--amber-50)', color: 'var(--amber-600)', borderRadius: 99, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="help-circle" size={11} color="var(--amber-600)" /> Question</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'var(--green-50)', color: 'var(--green-600)', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="check-circle" size={11} color="var(--green-600)" /> Answered</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: -0.2, marginBottom: 6 }}>Best practice for handling expired SSL certs on internal tools?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.55, marginBottom: 12 }}>We've got 3 internal tools whose certs are expiring in the next 2 weeks. Currently doing it manually — is there a better way through our PKI?</div>
          <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-100, #bbf7d0)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon name="check-circle" size={14} color="var(--green-600)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-600)', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 3 }}>Top answer · Aldo R.</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>Set up cert-bot with our internal CA — I wrote a runbook. <span style={{ color: 'var(--purple-700)', fontWeight: 600 }}>kb/internal-ssl-rotation</span></div>
            </div>
          </div>
          <Reactions emojis={['🙏', '💡', '👍']} count={9} comments={5} />
        </div>

        {/* MEME / FUN post */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <Author initials="JC" name="Joan Cabral" role="IT Support" time="Yesterday" accent="var(--purple-700)" category="Random & Fun" />
          <div style={{ fontSize: 14.5, color: 'var(--ink-900)', lineHeight: 1.55, marginBottom: 12 }}>When the user says "I didn't change anything" 🤨</div>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)', borderRadius: 10, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, color: 'rgba(255,255,255,.7)', fontFamily: "'JetBrains Mono', monospace" }}>./meme.gif</div>
            🕵️‍♂️
            <div style={{ position: 'absolute', bottom: 16, color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>"It worked yesterday"</div>
          </div>
          <Reactions emojis={['😂', '💀', '🤣']} count={42} comments={11} />
        </div>
      </div>

      {/* Right rail */}
      <div>
        {/* Stats card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 12 }}>Your activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, paddingBottom: 12, borderBottom: '1px solid var(--ink-100)' }}>
            {[['3', 'Posts'], ['28', 'Reactions'], ['11', 'Comments']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>{v}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-500)' }}>56 total posts on the board · 9 today</div>
        </div>

        {/* Upcoming events */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Upcoming</span>
            <span style={{ fontSize: 11, color: 'var(--purple-700)', fontWeight: 600, cursor: 'pointer' }}>All →</span>
          </div>
          {[
            ['MAY', '15', 'Q2 All-hands', '3:00 PM · Auditorium'],
            ['MAY', '17', 'Pizza Friday', '12:00 PM · Pantry'],
            ['MAY', '22', 'Hackathon', '9:00 AM · 3rd Floor'],
          ].map(([m, d, t, sub]) => (
            <div key={t} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--ink-100)', alignItems: 'center' }}>
              <div style={{ width: 38, textAlign: 'center', flex: '0 0 auto', background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: '4px 0' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--rose-600)', letterSpacing: 0.5 }}>{m}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink-900)' }}>{d}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-900)' }}>{t}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active people */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 12 }}>Most active · this week</div>
          {[
            ['Joan Cabral', 'IT Support', 14, 'var(--purple-700)'],
            ['Jay Lim', 'IT Support', 11, 'var(--orange-600)'],
            ['Mark Gerald V.', 'Intern', 8, 'var(--blue-600)'],
            ['Mira Soto', 'Intern', 6, 'var(--green-600)'],
          ].map(([n, r, c, color], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700 }}>{n.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{r}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{c} posts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </BoardShell>
);

window.CommunityBoardFeedFrame = CommunityBoardFeedFrame;
