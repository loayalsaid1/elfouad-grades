"use client"

import { useEffect, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function useAdminUser() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [schoolAccess, setSchoolAccess] = useState<number[]>([])
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/admin/login")
        return
      }
      setUser(user)
      // Fetch profile and school access
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profile)
      const { data: access } = await supabase
        .from("user_school_access")
        .select("school_id")
        .eq("user_id", user.id)
        if (profile && !profile.is_super_admin && (!access || access.length === 0)) 
          router.replace("/admin/dashboard/no-access")
      setSchoolAccess((access || []).map((a: any) => a.school_id))
    }
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, profile, schoolAccess }
}
