'use client'

import { useSystemStatus } from "@/contexts/SystemStatusContext"
import useGetUser from "@/hooks/useGetUser"

export default function AdminSystemDisabledWarning() {
  const { enabled, loading } = useSystemStatus()
	const { user, loading: userLoading } = useGetUser()
  if (loading || enabled || (!user && !userLoading)) return null

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
