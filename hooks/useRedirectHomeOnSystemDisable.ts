import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSystemStatus } from "@/contexts/SystemStatusContext"

export default function useSystemRedirect() {
  const { enabled, loading } = useSystemStatus()
  const router = useRouter()

  useEffect(() => {
    if (!enabled && !loading) {
      router.replace("/")
    }
  }, [enabled, loading, router])
}
