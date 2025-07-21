"use client"

import { useAdminUserContext } from "@/contexts/AdminUserContext"

/**
 * Hook to access admin user data from the global context
 * This replaces the previous implementation that fetched data repeatedly
 */
export function useAdminUser() {
  const { user, profile, schoolAccess, loading, error, refreshUser, signOut } = useAdminUserContext()
  return { user, profile, schoolAccess, loading, error, refreshUser, signOut }
}
