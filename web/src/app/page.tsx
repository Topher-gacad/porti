import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import AppsSection from '@/components/landing/AppsSection'
import WorkshopSection from '@/components/landing/WorkshopSection'
import TimelineSection from '@/components/landing/TimelineSection'
import NumbersSection from '@/components/landing/NumbersSection'
import CTASection from '@/components/landing/CTASection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'Porti — COMFAC IT Service Portal',
  description:
    'Submit a ticket, request access, or launch an internal app — all from a single sign-in.',
}

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--paper)' }}>
      <LandingHeader />
      <main>
        <LandingHero />
        <AppsSection />
        <WorkshopSection />
        <TimelineSection />
        <NumbersSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
