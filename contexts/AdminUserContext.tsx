'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface AdminUserProfile {
  id: string
  full_name: string | null
  email: string
  is_super_admin: boolean
  created_at: string
  updated_at: string
}

interface AdminUserContextType {
  user: User | null
  profile: AdminUserProfile | null
  schoolAccess: number[]
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const AdminUserContext = createContext<AdminUserContextType | undefined>(undefined)

export function useAdminUserContext() {
  const context = useContext(AdminUserContext)
  if (context === undefined) {
    throw new Error('useAdminUserContext must be used within an AdminUserProvider')
  }
  return context
}

export function AdminUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminUserProfile | null>(null)
  const [schoolAccess, setSchoolAccess] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()

  const fetchUserData = useCallback(async (authUser: User) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError) {
        throw profileError
      }

      setProfile(profileData)

      // Fetch school access
      const { data: accessData, error: accessError } = await supabase
        .from("user_school_access")
        .select("school_id")
        .eq("user_id", authUser.id)

      if (accessError) {
        throw accessError
      }

      const schoolIds = (accessData || []).map((a: any) => a.school_id)
      setSchoolAccess(schoolIds)

      // Check access permissions
      if (profileData && !profileData.is_super_admin && schoolIds.length === 0) {
        router.replace("/admin/dashboard/no-access")
      }

      setError(null)
    } catch (err: any) {
      console.error("Error fetching user data:", err)
      setError(err.message || "Failed to fetch user data")
    }
  }, [supabase, router])

  const getUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        throw authError
      }

      if (!authUser) {
        // No authenticated user, redirect to login
        setUser(null)
        setProfile(null)
        setSchoolAccess([])
        router.replace("/admin/login")
        return
      }

      setUser(authUser)
      await fetchUserData(authUser)
    } catch (err: any) {
      console.error("Error getting user:", err)
      setError(err.message || "Failed to authenticate user")
      router.replace("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [supabase, router, fetchUserData])

  const refreshUser = useCallback(async () => {
    if (user) {
      await fetchUserData(user)
    } else {
      await getUser()
    }
  }, [user, fetchUserData, getUser])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSchoolAccess([])
      setError(null)
      router.replace("/admin/login")
    } catch (err: any) {
      console.error("Error signing out:", err)
      setError(err.message || "Failed to sign out")
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    // Initial user fetch
    getUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchUserData(session.user)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setSchoolAccess([])
        setError(null)
        setLoading(false)
        router.replace("/admin/login")
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
        // Don't need to refetch profile data on token refresh
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, fetchUserData, getUser])

  const contextValue: AdminUserContextType = {
    user,
    profile,
    schoolAccess,
    loading,
    error,
    refreshUser,
    signOut,
  }

  return (
    <AdminUserContext.Provider value={contextValue}>
      {children}
    </AdminUserContext.Provider>
  )
}
