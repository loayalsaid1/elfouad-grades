"use client"

import { Loader2 } from "lucide-react"

export default function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-cyan-500" />
        <span className="text-lg text-gray-700">{message}</span>
      </div>
    </div>
  )
}
