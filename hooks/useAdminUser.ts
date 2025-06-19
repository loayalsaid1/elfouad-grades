"use client"

import { useEffect, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function useAdminUser() {
  const [user, setUser] = useState<any | null>(null)
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
    }
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return user
}
