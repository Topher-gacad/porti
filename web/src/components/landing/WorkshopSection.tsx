import PoroMark from '@/components/PoroMark'
import Icon from '@/components/Icon'
import Reveal from './Reveal'

type Project = {
  status: string
  tone: 'blue' | 'purple' | 'amber'
  title: string
  cat: string
  body: string
  eta: string
  leads: string[]
  leadName: string
}

const PROJECTS: Project[] = [
  {
    status: 'Beta', tone: 'blue',
    title: 'Self-serve WiFi vouchers', cat: 'Network',
    body: 'Captive-portal codes interns claim from a QR — no more printed vouchers on the wall.',
    eta: 'Late May', leads: ['JL', 'CG'], leadName: 'Jay Lim & 1 other',
  },
  {
    status: 'Building', tone: 'purple',
    title: 'Porti rebrand & redesign', cat: 'Portal',
    body: "We're rebuilding the IT portal from the ground up. You're looking at the new landing page.",
    eta: 'June', leads: ['TC', 'JC'], leadName: 'Topepe Cruz & 1 other',
  },
  {
    status: 'Planning', tone: 'amber',
    title: 'AI assistant for tickets', cat: 'Apps',
    body: 'Suggested replies and auto-classification so support tickets route themselves to the right team.',
    eta: 'Q3 · 26', leads: ['AR'], leadName: 'Aldo Reyes',
  },
]

const AVATAR_COLORS = ['var(--purple-700)', 'var(--orange-600)', 'var(--blue-600)']

const TONE_STYLES = {
  blue:   { dot: 'var(--blue-600)',   ring: 'var(--blue-50)',   text: 'var(--blue-600)' },
  purple: { dot: 'var(--purple-700)', ring: 'var(--purple-50)', text: 'var(--purple-700)' },
  amber:  { dot: 'var(--amber-600)',  ring: 'var(--amber-50)',  text: 'var(--amber-600)' },
}

export default function WorkshopSection() {
  return (
    <section
      id="workshop"
      className="relative overflow-hidden"
      style={{
        padding: '80px 0',
        background: 'linear-gradient(180deg, var(--card) 0%, var(--paper) 100%)',
        borderTop: '1px solid var(--ink-100)',
        borderBottom: '1px solid var(--ink-100)',
      }}
    >
      {/* Animated blobs */}
      <svg className="porti-blob-a" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--purple-100)" stopOpacity=".9" />
            <stop offset="60%"  stopColor="var(--purple-50)"  stopOpacity=".4" />
            <stop offset="100%" stopColor="var(--purple-50)"  stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-a)" d="M44.6,-58.3C56.4,-49.7,63.1,-34.4,67.4,-18.6C71.7,-2.7,73.7,13.7,67.7,26.6C61.7,39.5,47.7,48.9,33.1,55.6C18.5,62.2,3.2,66.2,-12.4,65.1C-28,64,-43.9,57.9,-54.4,46.6C-64.9,35.3,-69.9,18.7,-69.6,2.4C-69.4,-13.9,-63.9,-29.9,-53.6,-39.3C-43.4,-48.6,-28.4,-51.3,-13.7,-55.5C0.9,-59.6,15.3,-65.3,32.8,-66.8Z" transform="translate(100 100)" />
      </svg>
      <svg className="porti-blob-b" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--purple-200)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--purple-50)"  stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-b)" d="M37.2,-52.5C48.2,-44.7,57,-33.8,61.7,-21.2C66.3,-8.5,66.7,5.9,62.5,18.5C58.3,31.2,49.4,42.1,38.1,49.6C26.9,57.1,13.4,61.2,-0.7,62.2C-14.9,63.2,-29.7,61.2,-41.2,53.6C-52.6,46,-60.7,32.8,-64.2,18.6C-67.6,4.5,-66.5,-10.6,-60.8,-23.4C-55.1,-36.3,-44.9,-46.9,-33.1,-54.2C-21.3,-61.4,-7.9,-65.4,2.9,-69.3Z" transform="translate(100 100)" />
      </svg>
      <svg className="porti-blob-c" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="blob-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--purple-100)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--purple-50)"  stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#blob-c)" d="M48.6,-66.4C61.1,-57.1,67.1,-40.4,69.7,-24.2C72.2,-7.9,71.3,7.9,65.1,21.4C58.8,35,47.2,46.2,33.7,54.6C20.1,62.9,4.6,68.3,-11.6,68.7C-27.7,69,-44.5,64.3,-55.6,53.6C-66.7,42.9,-72.1,26.3,-72.5,9.5C-72.9,-7.3,-68.3,-24.4,-58.6,-36.7C-48.9,-49,-34.1,-56.5,-19.4,-63C-4.7,-69.5,9.9,-75,23.7,-74C37.5,-72.9,50.5,-65.2,48.6,-66.4Z" transform="translate(100 100)" />
      </svg>

      <div className="max-w-[1280px] mx-auto w-full px-16">
        {/* Section header */}
        <Reveal>
          <div className="relative flex items-end justify-between mb-8">
            <div>
              <div
                className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full"
                style={{
                  background: 'var(--purple-50)',
                  border: '1px solid var(--purple-100)',
                }}
              >
                <PoroMark size={20} color="var(--purple-700)" />
                <span
                  className="text-[11px] font-bold tracking-[1.2px] uppercase"
                  style={{ color: 'var(--purple-700)' }}
                >
                  Porti&apos;s Workshop
                </span>
              </div>
              <h2
                className="font-bold m-0"
                style={{
                  fontSize: 38,
                  lineHeight: 1.1,
                  letterSpacing: -1.2,
                  color: 'var(--ink-900)',
                  maxWidth: 640,
                }}
              >
                On the <span style={{ color: 'var(--purple-700)' }}>workbench</span> right now.
              </h2>
              <p
                className="mt-2.5 m-0"
                style={{ fontSize: 15, color: 'var(--ink-500)', maxWidth: 560, lineHeight: 1.55 }}
              >
                A peek behind the curtain. Projects the IT team is actively planning, building, or rolling out.
              </p>
            </div>
            <a
              href="#"
              className="text-[13px] font-semibold flex items-center gap-1.5 shrink-0 mb-1"
              style={{ color: 'var(--purple-700)' }}
            >
              See all projects <Icon name="arrow-right" size={13} color="var(--purple-700)" />
            </a>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="relative grid grid-cols-3 gap-5">
          {PROJECTS.map((p, i) => {
            const tone = TONE_STYLES[p.tone]
            return (
              <Reveal key={p.title} delay={i * 100}>
                <article
                  className="relative flex flex-col gap-[18px] rounded-[18px] p-7 transition-shadow hover:shadow-xl cursor-pointer"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--ink-100)',
                    minHeight: 320,
                    boxShadow: '0 1px 2px rgba(20,17,15,.05), 0 8px 24px -10px rgba(20,17,15,.10)',
                  }}
                >
                  {/* Status + category */}
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.4px] uppercase"
                      style={{ color: tone.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: tone.dot, boxShadow: `0 0 0 4px ${tone.ring}` }}
                      />
                      {p.status}
                    </span>
                    <span
                      className="text-[11px] font-semibold px-[9px] py-[3px] rounded-full"
                      style={{ color: 'var(--ink-500)', background: 'var(--paper)' }}
                    >
                      {p.cat}
                    </span>
                  </div>

                  {/* Title + body */}
                  <div className="flex-1">
                    <h3
                      className="font-bold m-0 mb-2.5"
                      style={{ fontSize: 24, letterSpacing: -0.7, color: 'var(--ink-900)', lineHeight: 1.15 }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm m-0" style={{ color: 'var(--ink-500)', lineHeight: 1.6 }}>
                      {p.body}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid var(--ink-100)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex">
                        {p.leads.map((initial, j) => (
                          <span
                            key={j}
                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                            style={{
                              background: AVATAR_COLORS[j % AVATAR_COLORS.length],
                              border: '2.5px solid var(--card)',
                              marginLeft: j > 0 ? -10 : 0,
                            }}
                          >
                            {initial}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--ink-700)' }}>
                        {p.leadName}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-[5px] text-xs font-semibold" style={{ color: 'var(--ink-700)' }}>
                      <Icon name="calendar" size={12} color="var(--ink-500)" /> {p.eta}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
