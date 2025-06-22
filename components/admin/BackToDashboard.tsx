"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BackToDashboard() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      className="mb-6 flex items-center gap-2 hover:bg-[#223152] hover:text-white hover:border-[#223152] transition-all duration-300 shadow-md"
      onClick={() => router.push("/admin/dashboard")}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  )
}
