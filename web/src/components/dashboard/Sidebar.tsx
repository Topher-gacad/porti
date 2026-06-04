'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

type NavItem = {
  label: string
  href: string
  requireRoles?: string[]
  requirePermission?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',    href: '/dashboard' },
  { label: 'Companies',   href: '/dashboard/companies',  requirePermission: 'manage-company' },
  { label: 'Users',       href: '/dashboard/users' },
  { label: 'Branches',    href: '/dashboard/branches' },
  { label: 'Departments', href: '/dashboard/departments' },
  { label: 'Teams',       href: '/dashboard/teams' },
  { label: 'Roles',       href: '/dashboard/roles',       requirePermission: 'assign-roles' },
  { label: 'Audit Log',   href: '/dashboard/audit-log',  requirePermission: 'manage-users' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { hasAnyRole, can, isLoading } = usePermissions()

  const visibleItems = NAV_ITEMS.filter(({ requireRoles, requirePermission }) => {
    // Ungated items always show. Gated items stay hidden until permissions load,
    // so restricted links never flash for users who lack access.
    if (!requireRoles && !requirePermission) return true
    if (isLoading) return false
    if (requireRoles && !hasAnyRole(...requireRoles)) return false
    if (requirePermission && !can(requirePermission) && !hasAnyRole('super-admin', 'developer')) return false
    return true
  })

  return (
    <aside className="w-56 shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-slate-700">
        <span className="text-sm font-semibold text-white tracking-wide">IT Portal</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleItems.map(({ label, href }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center mx-2 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
