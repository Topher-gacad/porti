// App — Porti rebrand canvas. Logo, landing, login.
const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle, TweakRadio } = window;

function App() {
  return (
    <div>
      <DesignCanvas
        title="Porti — UI/UX Redesign"
        subtitle="Logo system · Public landing · Login. Rebranded from COMFAC IT Service Portal."
      >
        <DCSection id="rebrand" title="1 · Logo system" subtitle="The Porti emblem — a faceless Poro silhouette with a 'P' carved as negative space.">
          <DCArtboard id="rebrand-logo" label="Porti · logo system" width={1180} height={2200}>
            <RebrandFrame />
          </DCArtboard>
        </DCSection>

        <DCSection id="public" title="2 · Public landing" subtitle="What a logged-out visitor sees at porti.comfac-it.com">
          <DCArtboard id="landing" label="Public landing · scrollable" width={1280} height={3800}>
            <LandingFrame />
          </DCArtboard>
          <DCArtboard id="all-services" label="All services modal · click '5 more'" width={1280} height={820}>
            <AllServicesFrame />
          </DCArtboard>
        </DCSection>

        <DCSection id="login" title="3 · Login" subtitle="Single email + password — role derived server-side. Full auth states + 2FA + password reset flow.">
          <DCArtboard id="login-bold" label="Login · BOLD variant (big Poro)" width={1280} height={820}>
            <LoginFrameBold state="default" />
          </DCArtboard>
          <DCArtboard id="login-bold-error" label="Login · BOLD variant (error)" width={1280} height={820}>
            <LoginFrameBold state="error" />
          </DCArtboard>
          <DCArtboard id="login-default" label="Login · default" width={1280} height={820}>
            <LoginFrameNoRole state="default" />
          </DCArtboard>
          <DCArtboard id="login-loading" label="Login · signing in (loading)" width={1280} height={820}>
            <LoginFrameNoRole state="loading" />
          </DCArtboard>
          <DCArtboard id="login-error" label="Login · incorrect credentials" width={1280} height={820}>
            <LoginFrameNoRole state="error" />
          </DCArtboard>
          <DCArtboard id="login-locked" label="Login · account locked" width={1280} height={820}>
            <LoginFrameNoRole state="locked" />
          </DCArtboard>
          <DCArtboard id="login-expired" label="Login · password expired" width={1280} height={820}>
            <LoginFrameNoRole state="expired" />
          </DCArtboard>
          <DCArtboard id="login-not-found" label="Login · email not in directory" width={1280} height={820}>
            <LoginFrameNoRole state="not-in-directory" />
          </DCArtboard>
          <DCArtboard id="login-2fa" label="Login · 2FA verification" width={1280} height={820}>
            <Login2FAFrame />
          </DCArtboard>
          <DCArtboard id="login-2fa-wrong" label="Login · 2FA wrong code" width={1280} height={820}>
            <Login2FAFrame state="wrong" />
          </DCArtboard>
          <DCArtboard id="forgot-email" label="Forgot password · enter email" width={1280} height={820}>
            <ForgotPasswordFrame step="email" />
          </DCArtboard>
          <DCArtboard id="forgot-sent" label="Forgot password · check inbox" width={1280} height={820}>
            <ForgotPasswordFrame step="sent" />
          </DCArtboard>
          <DCArtboard id="forgot-new" label="Forgot password · set new" width={1280} height={820}>
            <ForgotPasswordFrame step="new" />
          </DCArtboard>
          <DCArtboard id="forgot-success" label="Forgot password · done" width={1280} height={820}>
            <ForgotPasswordFrame step="success" />
          </DCArtboard>
        </DCSection>

        <DCSection id="intern-apply" title="4 · Internship application" subtitle="Public entry point. Email verification gate before opening the form.">
          <DCArtboard id="intern-apply" label="Step 1 · Email entry" width={1280} height={920}>
            <InternApplyFrame />
          </DCArtboard>
          <DCArtboard id="apply-verify" label="Step 2 · Verify code" width={1280} height={920}>
            <ApplyVerifyFrame />
          </DCArtboard>
          <DCArtboard id="apply-details" label="Step 3 · Personal + school + hours" width={1280} height={1100}>
            <ApplyDetailsFrame />
          </DCArtboard>
          <DCArtboard id="apply-resume" label="Step 4 · Resume upload (PDF · 5MB)" width={1280} height={920}>
            <ApplyResumeFrame state="uploaded" />
          </DCArtboard>
          <DCArtboard id="apply-resume-empty" label="Step 4 · Resume upload (empty)" width={1280} height={920}>
            <ApplyResumeFrame state="empty" />
          </DCArtboard>
          <DCArtboard id="apply-cover" label="Step 5 · Cover letter" width={1280} height={920}>
            <ApplyCoverFrame />
          </DCArtboard>
          <DCArtboard id="apply-success" label="Step 6 · Submitted" width={1280} height={920}>
            <ApplySuccessFrame />
          </DCArtboard>
        </DCSection>

        <DCSection id="admin" title="6 · Admin · Dashboard & Services" subtitle="Top-nav shell with submenu patterns — flat root, contextual depth via secondary tab row or mega-menu.">
          <DCArtboard id="admin-dashboard-top" label="Dashboard — Top nav" width={1280} height={1100}>
            <AdminDashboardTopFrame />
          </DCArtboard>
          <DCArtboard id="admin-services-top" label="Services — Top nav" width={1280} height={1080}>
            <AdminServicesTopFrame />
          </DCArtboard>
          <DCArtboard id="admin-requests-top" label="Requests — Top nav" width={1280} height={1020}>
            <AdminRequestsTopFrame />
          </DCArtboard>
          <DCArtboard id="admin-submitted-by-me" label="Requests · Submitted by me tab (admin)" width={1280} height={900}>
            <AdminSubmittedByMeFrame />
          </DCArtboard>
          <DCArtboard id="admin-board" label="Community Board — Feed" width={1280} height={1700}>
            <CommunityBoardFeedFrame />
          </DCArtboard>
          <DCArtboard id="admin-people-users" label="People · Users" width={1280} height={1100}>
            <PeopleUsersFrame />
          </DCArtboard>
          <DCArtboard id="admin-people-detail" label="People · User detail (roles & permissions)" width={1280} height={1500}>
            <PeopleUserDetailFrame />
          </DCArtboard>
          <DCArtboard id="interns-invites" label="Interns · Invite Codes" width={1280} height={1100}>
            <InternsInvitesFrame />
          </DCArtboard>
          <DCArtboard id="interns-wifi" label="Interns · WiFi Vouchers" width={1280} height={1100}>
            <WifiVouchersFrame />
          </DCArtboard>
          <DCArtboard id="interns-seats" label="Interns · Seat Map" width={1280} height={1250}>
            <SeatMapFrame />
          </DCArtboard>
          <DCArtboard id="interns-security" label="Interns · Scan Activity & Security" width={1280} height={1050}>
            <SecurityFrame />
          </DCArtboard>
          <DCArtboard id="interns-planning" label="Interns · Planning" width={1280} height={1200}>
            <PlanningFrame />
          </DCArtboard>
          <DCArtboard id="interns-attendance" label="Interns · Attendance Analytics" width={1280} height={1450}>
            <AttendanceFrame />
          </DCArtboard>
          <DCArtboard id="admin-people-itstaff" label="People · IT Staff (management)" width={1280} height={950}>
            <PeopleITStaffFrame />
          </DCArtboard>
          <DCArtboard id="admin-people-interns" label="People · Interns (management)" width={1280} height={1100}>
            <PeopleInternsFrame />
          </DCArtboard>
          <DCArtboard id="admin-subnav-secondary" label="Submenu pattern · Secondary tab row (recommended)" width={1280} height={900}>
            <TopSubnavSecondaryFrame />
          </DCArtboard>
          <DCArtboard id="admin-subnav-mega" label="Submenu pattern · Mega-menu hover" width={1280} height={900}>
            <TopSubnavMegaFrame />
          </DCArtboard>
        </DCSection>

        <DCSection id="track" title="7 · Track application" subtitle="Status timeline, submission summary, activity feed — and a withdraw flow.">
          <DCArtboard id="track-default" label="Track application · in review" width={1280} height={960}>
            <TrackApplicationFrame status="review" />
          </DCArtboard>
          <DCArtboard id="track-withdraw" label="Track · withdraw confirmation" width={1280} height={960}>
            <TrackWithdrawFrame />
          </DCArtboard>
        </DCSection>

        <DCSection id="intern" title="8 · Intern registration" subtitle="2-column wizard. Vertical stepper rail + focused form. Admins generate invite codes in-app.">
          <DCArtboard id="intern-1" label="Step 1 · Invite code" width={1280} height={820}>
            <InternRegFrame step={0} />
          </DCArtboard>
          <DCArtboard id="intern-2" label="Step 2 · About you" width={1280} height={820}>
            <InternRegFrame step={1} />
          </DCArtboard>
          <DCArtboard id="intern-3" label="Step 3 · Internship" width={1280} height={820}>
            <InternRegFrame step={2} />
          </DCArtboard>
          <DCArtboard id="intern-4" label="Step 4 · Password & review" width={1280} height={820}>
            <InternRegFrame step={3} />
          </DCArtboard>
          <DCArtboard id="intern-5" label="Step 5 · Success" width={1280} height={820}>
            <InternRegFrame step={4} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
