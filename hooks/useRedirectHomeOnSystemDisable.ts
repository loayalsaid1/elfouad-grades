import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSystemStatus } from "@/contexts/SystemStatusContext"
import useGetUser from "@/hooks/useGetUser"

export default function useSystemRedirect() {
  const { user, loading: userLoading } = useGetUser();
  const { enabled, loading } = useSystemStatus()
  const router = useRouter()
  
  useEffect(() => {
    if (!enabled && !loading && !user  && !userLoading) {
      router.replace("/")
    }
  }, [enabled, loading, router, user, userLoading])
}
