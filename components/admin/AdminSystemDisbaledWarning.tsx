// a message to stick to teh top of teh screen when there is an admin using the system and the system is disabled instead of blocking everything and redirecting him to the home where he sees system disabled message like normal users
'use client'

import { useSystemStatus } from "@/contexts/SystemStatusContext"


export default function AdminSystemDisabledWarning() {
  const { enabled, loading } = useSystemStatus()
  if (loading || enabled) return null

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm z-40">
      <div className="max-w-4xl mx-auto flex items-center gap-2 px-4 py-1">
        <span className="font-semibold">Admin Mode:</span>
        <span>
          System is currently <b>disabled</b> for normal users. You can still manage settings and data.
        </span>
      </div>
    </div>
  )
}
