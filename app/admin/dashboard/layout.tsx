import { ReactNode } from "react"
import Sidebar from "@/components/admin/Sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-stretch min-h-full max-h-full overflow-y-auto">
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-full max-h-full overflow-auto bg-gradient-to-br from-slate-100 to-blue-50 py-8 md:pl-0 pl-6">
        {children}
      </main>
    </div>
  )
}
