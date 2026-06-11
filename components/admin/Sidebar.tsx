"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminUser } from "@/hooks/useAdminUser"
import {
  Upload,
  Settings,
  Users,
  Database,
  LogOut,
  TestTube,
  History,
  FileDiff,
  School,
  UserCircle,
} from "lucide-react"
import { useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Database },
  { href: "/admin/dashboard/upload", label: "Upload Results", icon: Upload },
  { href: "/admin/dashboard/settings", label: "System Settings", icon: Settings },
  { href: "/admin/dashboard/test-results", label: "Test Results", icon: TestTube },
  { href: "/admin/dashboard/logins", label: "Admin Logins", icon: History },
  { href: "/admin/dashboard/diffs", label: "Backup Comparison", icon: FileDiff },
  { href: "/admin/dashboard/schools", label: "Schools", icon: School },
  { href: "/admin/dashboard/admins", label: "Admins", icon: Users, superAdmin: true },
]

export default function Sidebar() {
  const { user, profile } = useAdminUser()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!user) return null

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-lg border border-gray-200"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open sidebar"
      >
        <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-60 bg-white border-r border-gray-200 shadow-lg
          flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex md:w-60 md:h-screen 
        `}
      >
        {/* User Info */}
        <div className="flex items-center gap-3 h-20 px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="bg-[#223152] rounded-full p-2 flex items-center justify-center">
            <UserCircle className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[#223152] truncate text-sm">{profile?.full_name || user.email}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
            {profile?.is_super_admin && <span className="text-xs text-yellow-600 font-bold">Super Admin</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navLinks.map((link) => {
            if (link.superAdmin && !profile?.is_super_admin) return null
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium gap-3
                  ${
                    active
                      ? "bg-[#223152] text-white shadow-sm"
                      : "text-[#223152] hover:bg-blue-50 hover:text-[#1a2642]"
                  }`}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg font-medium text-sm w-full transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
