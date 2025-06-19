"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BackToDashboard() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      className="mb-4 flex items-center gap-2"
      onClick={() => router.push("/admin/dashboard")}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  )
}
