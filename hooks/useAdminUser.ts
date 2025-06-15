"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function useAdminUser() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

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
