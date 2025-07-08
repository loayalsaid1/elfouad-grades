import { ReactNode } from "react"
import Sidebar from "@/components/admin/Sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
