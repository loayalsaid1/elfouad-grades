"use client"

import { Loader2 } from "lucide-react"

export default function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8 flex items-center justify-center">
      <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-xl border-2 border-gray-100">
        <div className="bg-[#223152] p-4 rounded-full mb-6 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <span className="text-lg text-[#223152] font-medium animate-fade-in">{message}</span>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-[#223152] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#223152] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#223152] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
