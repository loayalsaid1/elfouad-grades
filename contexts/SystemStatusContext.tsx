'use client'

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const SystemStatusContext = createContext({ enabled: true, loading: true })

export function useSystemStatus() {
  return useContext(SystemStatusContext)
}

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const supabase = createClientComponentClient()
    // Initial fetch
    supabase
      .from("system_settings")
      .select("value")
      .eq("key", "system_enabled")
      .single()
      .then(({ data }) => {
        setEnabled(data?.value?.enabled !== false)
        setLoading(false)
      })

    // Real-time subscription
    const channel = supabase
      .channel("system_enabled")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "system_settings", filter: "key=eq.system_enabled" },
        (payload) => {
          setEnabled(payload.new.value?.enabled !== false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <SystemStatusContext.Provider value={{ enabled, loading }}>
      {children}
    </SystemStatusContext.Provider>
  )
}
