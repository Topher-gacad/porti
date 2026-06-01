import Icon from '@/components/Icon'
import Reveal from './Reveal'

type Entry = {
  date: string
  kind: 'release' | 'milestone'
  icon: string
  tone: string
  title: string
  body: string
  metric?: string
  metricLabel?: string
  latest?: boolean
}

const SHIPPED: Entry[] = [
  {
    date: 'May 2026', kind: 'release', icon: 'rocket', tone: 'green',
    title: 'Service Catalog launch',
    body: 'Pre-templated requests for the 12 most-asked-for things — VPN, new laptop, password reset, GitLab access. Skips the blank form for 65% of submissions.',
    metric: '−40% time to file', metricLabel: 'avg. first ticket', latest: true,
  },
  {
    date: 'Apr 2026', kind: 'release', icon: 'shield', tone: 'purple',
    title: 'SLA monitoring & auto-routing',
    body: 'Tickets now auto-route to the right engineer based on type and load. Past-SLA alerts ping the lead before they breach.',
    metric: '96.4%', metricLabel: 'SLA compliance',
  },
  {
    date: 'Mar 2026', kind: 'release', icon: 'monitor', tone: 'blue',
    title: 'Synx FMS — phase 2 rollout',
    body: 'Facility maintenance now lives entirely in Synx. Mobile crew app, photo evidence on tickets, parts tracking.',
    metric: '14 sites', metricLabel: 'fully migrated',
  },
  {
    date: 'Feb 2026', kind: 'milestone', icon: 'award', tone: 'amber',
    title: 'Internship Program v2 kickoff',
    body: 'New onboarding flow with invite codes, attendance QR check-in, and weekly mentor 1:1s. 25 interns through so far this batch.',
  },
  {
    date: 'Jan 2026', kind: 'release', icon: 'mail', tone: 'rose',
    title: 'Mailcow upgrade & SPF/DKIM cleanup',
    body: 'Migrated to Mailcow 2024.10, fixed DMARC alignment for all 5 domains. Inbox-placement rate jumped overnight.',
    metric: '+34pp', metricLabel: 'inbox-placement',
  },
  {
    date: 'Dec 2025', kind: 'milestone', icon: 'check-circle', tone: 'green',
    title: 'ERPNext modules — 12 live',
    body: 'Sales, Inventory, Manufacturing, HR, Payroll, Accounts… all consolidated under one ERP. Old Excel sheets archived.',
  },
]

function DatePill({ entry }: { entry: Entry }) {
  return (
    <div
      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] text-white"
      style={{
        background: 'var(--purple-700)',
        boxShadow: '0 6px 16px -8px rgba(91,77,200,.45), 0 2px 4px -1px rgba(91,77,200,.2)',
      }}
    >
      {entry.date}
    </div>
  )
}

function TitleCard({ entry, side }: { entry: Entry; side: 'left' | 'right' }) {
  return (
    <article
      className="max-w-[440px] w-full"
      style={{ textAlign: side === 'left' ? 'right' : 'left' }}
    >
      <div
        className="flex items-center gap-2 mb-2"
        style={{ justifyContent: side === 'left' ? 'flex-end' : 'flex-start' }}
      >
        {entry.latest && (
          <span
            className="text-[10px] font-bold tracking-[0.5px] uppercase inline-flex items-center gap-1"
            style={{ color: 'var(--purple-700)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple-700)' }} />
            Latest
          </span>
        )}
        <span
          className="text-[10px] font-bold px-[9px] py-[2px] rounded-full uppercase tracking-[0.4px]"
          style={{ background: 'var(--paper)', color: 'var(--ink-500)', border: '1px solid var(--ink-100)' }}
        >
          {entry.kind === 'release' ? 'Release' : 'Milestone'}
        </span>
      </div>
      <h3
        className="font-extrabold m-0 mb-2.5"
        style={{ fontSize: 22, letterSpacing: -0.6, color: 'var(--ink-900)', lineHeight: 1.2 }}
      >
        {entry.title}
      </h3>
      <p className="m-0" style={{ fontSize: 13.5, color: 'var(--ink-500)', lineHeight: 1.6 }}>
        {entry.body}
      </p>
      {entry.metric && (
        <div
          className="mt-3 inline-flex items-baseline gap-1.5 px-[11px] py-[5px] rounded-full"
          style={{ background: 'var(--purple-50)' }}
        >
          <span className="text-[13px] font-extrabold tracking-[-0.3px]" style={{ color: 'var(--purple-700)' }}>
            {entry.metric}
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--ink-700)' }}>
            {entry.metricLabel}
          </span>
        </div>
      )}
    </article>
  )
}

export default function TimelineSection() {
  return (
    <section
      id="shipped"
      className="relative overflow-hidden"
      style={{ padding: '80px 0 96px', background: 'var(--paper)' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: -160, left: -120, width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(123,111,220,.10) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto w-full px-16">
        {/* Header */}
        <Reveal>
          <div className="relative text-center mb-12">
            <div
              className="text-[11px] font-bold tracking-[1.5px] uppercase mb-2.5"
              style={{ color: 'var(--purple-700)' }}
            >
              Shipped
            </div>
            <h2
              className="font-extrabold m-0"
              style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: -1.4, color: 'var(--ink-900)' }}
            >
              Timeline
            </h2>
            <p
              className="mt-3.5 mx-auto m-0"
              style={{ fontSize: 14, color: 'var(--ink-500)', maxWidth: 520, lineHeight: 1.55 }}
            >
              Newest first. Every entry is a real release running in production today.
            </p>
          </div>
        </Reveal>

        {/* Alternating timeline */}
        <div className="relative mx-auto" style={{ maxWidth: 980 }}>
          {/* Center rail */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 rounded-full"
            style={{
              left: '50%',
              width: 2,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg, var(--purple-700) 0%, var(--ink-200) 100%)',
            }}
          />

          {SHIPPED.map((entry, i) => {
            const cardLeft = i % 2 === 0
            return (
              <Reveal key={entry.title} delay={i * 80}>
                <div
                  className="relative grid items-center"
                  style={{
                    gridTemplateColumns: '1fr 40px 1fr',
                    marginBottom: i < SHIPPED.length - 1 ? 32 : 0,
                  }}
                >
                  {/* Left slot */}
                  <div className="pr-7 flex justify-end">
                    {cardLeft ? <TitleCard entry={entry} side="left" /> : <DatePill entry={entry} />}
                  </div>

                  {/* Center dot */}
                  <div className="flex justify-center relative z-10">
                    <div
                      className="w-[18px] h-[18px] rounded-full"
                      style={{
                        background: 'var(--card)',
                        border: '3px solid var(--purple-700)',
                        boxShadow: entry.latest
                          ? '0 0 0 6px var(--purple-50), 0 2px 8px -2px rgba(91,77,200,.4)'
                          : '0 0 0 4px var(--paper)',
                      }}
                    />
                  </div>

                  {/* Right slot */}
                  <div className="pl-7 flex justify-start">
                    {cardLeft ? <DatePill entry={entry} /> : <TitleCard entry={entry} side="right" />}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={SHIPPED.length * 80}>
          <div className="text-center mt-12">
            <button
              className="inline-flex items-center gap-1.5 text-[13px] font-medium rounded-[10px] px-[22px] py-2.5 transition-opacity hover:opacity-70"
              style={{ background: 'transparent', color: 'var(--ink-700)', border: '1px solid var(--ink-200)' }}
            >
              Load older milestones <Icon name="chevron-down" size={13} color="var(--ink-700)" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
