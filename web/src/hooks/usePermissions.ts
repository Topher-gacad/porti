import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session, status } = useSession()

  const roles       = session?.user?.roles       ?? []
  const permissions = session?.user?.permissions ?? []

  function can(permission: string): boolean {
    return permissions.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.includes(role)
  }

  function hasAnyRole(...check: string[]): boolean {
    return check.some((r) => roles.includes(r))
  }

  return {
    can,
    hasRole,
    hasAnyRole,
    roles,
    permissions,
    isLoading: status === 'loading',
  }
}
