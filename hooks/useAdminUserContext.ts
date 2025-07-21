"use client"

import { useAdminUserContext } from "@/contexts/AdminUserContext"

/**
 * Hook to access admin user data from the global context
 * This replaces the old useAdminUser hook that fetched data repeatedly
 */
export function useAdminUser() {
  return useAdminUserContext()
}

/**
 * Legacy hook compatibility - returns the same interface as before
 * @deprecated Use useAdminUser instead
 */
export function useAdminUserLegacy() {
  const { user, profile, schoolAccess } = useAdminUserContext()
  return { user, profile, schoolAccess }
}
