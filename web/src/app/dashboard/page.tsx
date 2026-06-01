'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'

const QUICK_LINKS = [
  {
    label: 'Users',
    href: '/dashboard/users',
    permission: 'manage-users',
    description: 'Manage portal users and role assignments',
  },
  {
    label: 'Branches',
    href: '/dashboard/branches',
    permission: 'manage-branches',
    description: 'Manage company branch locations',
  },
  {
    label: 'Departments',
    href: '/dashboard/departments',
    permission: 'manage-departments',
    description: 'Manage departments within branches',
  },
  {
    label: 'Teams',
    href: '/dashboard/teams',
    permission: 'manage-teams',
    description: 'Manage teams and their members',
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const { can, roles, hasAnyRole } = usePermissions()

  const name = session?.user?.name ?? 'there'
  const primaryRole = roles[0] ?? 'user'
  const hasCompany = session?.user?.companyId !== null

  const quickLinks = QUICK_LINKS.filter(({ permission }) => can(permission))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">
          Welcome back, {name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
            {primaryRole}
          </span>
          {!hasCompany && (
            <span className="text-xs text-amber-500">
              No company assigned — contact a super-admin
            </span>
          )}
        </div>
      </div>

      {hasAnyRole('super-admin', 'developer') && (
        <div className="mb-6 p-4 rounded-lg border border-slate-700 bg-slate-800/40">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Platform
          </p>
          <Link
            href="/dashboard/companies"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage companies →
          </Link>
        </div>
      )}

      {quickLinks.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Quick access
          </p>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ label, href, description }) => (
              <Link
                key={href}
                href={href}
                className="block p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-colors group"
              >
                <p className="text-sm font-medium text-slate-200 mb-1 group-hover:text-white transition-colors">
                  {label}
                </p>
                <p className="text-xs text-slate-500">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {quickLinks.length === 0 && !hasAnyRole('super-admin', 'developer') && (
        <p className="text-sm text-slate-500">
          Your account is active. Management features will appear here once your company admin assigns you a role.
        </p>
      )}
    </div>
  )
}
