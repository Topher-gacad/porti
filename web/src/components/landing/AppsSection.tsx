'use client'
import { useRef, useState } from 'react'
import Icon from '@/components/Icon'
import Reveal from './Reveal'
import AllServicesModal from '@/components/AllServicesModal'

const APPS: [string, string, string, string, string][] = [
  ['E', 'var(--ink-900)', 'var(--card)',      'ERPNext',     'Finance, HR, inventory'],
  ['N', '#fff',           '#0082c9',           'Nextcloud',   'Files & collaboration'],
  ['S', '#fff',           'var(--orange-600)', 'Synx FMS',    'Facility maintenance'],
  ['S', '#fff',           'var(--blue-600)',   'Synx Sched',  'Crew scheduling'],
  ['C', '#fff',           'var(--purple-700)', 'Porti',       'IT service portal'],
  ['S', '#fff',           'var(--violet-600)', 'Steward',     'Asset & inventory'],
  ['M', '#fff',           'var(--amber-600)',  'Mailcow',     'Email & groupware'],
  ['R', '#fff',           '#5865F2',           'Rocket.Chat', 'Internal messaging'],
  ['J', '#fff',           '#2684FF',           'Jitsi',       'Video conferencing'],
  ['G', '#fff',           'var(--ink-900)',    'Gitea',       'Source control'],
  ['W', '#fff',           '#1568b3',           'Wiki',        'Internal knowledge base'],
  ['B', '#fff',           'var(--rose-600)',   'BookStack',   'Documentation'],
]

const CARD_W = 220
const CARD_GAP = 14
const SCROLL_STEP = (CARD_W + CARD_GAP) * 3

export default function AppsSection() {
  const stripRef = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)

  function scroll(dir: 'left' | 'right') {
    stripRef.current?.scrollBy({ left: dir === 'right' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <section
      id="services"
      className="relative overflow-hidden"
      style={{
        padding: '72px 0 80px',
        background: 'var(--card)',
        borderTop: '1px solid var(--ink-100)',
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-16">
        {/* Header */}
        <Reveal>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-2"
              style={{ color: 'var(--ink-500)' }}
            >
              Apps &amp; services
            </div>
            <h2
              className="font-bold m-0"
              style={{
                fontSize: 32,
                lineHeight: 1.15,
                letterSpacing: -0.8,
                color: 'var(--ink-900)',
              }}
            >
              Everything COMFAC runs on.
            </h2>
            <p className="text-[13.5px] mt-1.5 m-0" style={{ color: 'var(--ink-500)' }}>
              All accessible from your COMFAC account — no separate logins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="text-[13px] font-semibold flex items-center gap-1.5 mr-1 bg-transparent border-none p-0 cursor-pointer font-[inherit]"
              style={{ color: 'var(--purple-700)' }}
            >
              See all <Icon name="arrow-right" size={13} color="var(--purple-700)" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: 'var(--card)', border: '1px solid var(--ink-200)' }}
              aria-label="Scroll left"
            >
              <Icon name="arrow-left" size={14} color="var(--ink-700)" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: 'var(--ink-900)' }}
              aria-label="Scroll right"
            >
              <Icon name="arrow-right" size={14} color="#fff" />
            </button>
          </div>
        </div>
        </Reveal>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-12 pointer-events-none z-10"
            style={{ background: 'linear-gradient(90deg, var(--paper) 0%, transparent 100%)' }}
          />
          {/* Right fade */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 right-0 w-12 pointer-events-none z-10"
            style={{ background: 'linear-gradient(270deg, var(--paper) 0%, transparent 100%)' }}
          />

          <div ref={stripRef} className="apps-strip">
            {APPS.map(([letter, fg, bg, label, desc]) => (
              <article
                key={label}
                className="flex items-center gap-3.5 rounded-[14px] p-[18px] cursor-pointer transition-shadow hover:shadow-md"
                style={{
                  flex: `0 0 ${CARD_W}px`,
                  scrollSnapAlign: 'start',
                  background: 'var(--card)',
                  border: '1px solid var(--ink-100)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg font-extrabold shrink-0"
                  style={{ background: bg, color: fg, letterSpacing: -0.5 }}
                >
                  {letter}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold truncate" style={{ color: 'var(--ink-900)' }}>
                    {label}
                  </div>
                  <div className="text-[11.5px] mt-0.5 truncate" style={{ color: 'var(--ink-500)' }}>
                    {desc}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <AllServicesModal open={showModal} onClose={() => setShowModal(false)} />
    </section>
  )
}
