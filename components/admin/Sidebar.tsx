"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminUser } from "@/hooks/useAdminUser"
import { Upload, Settings, Users, Database, LogOut, TestTube, History, FileDiff, School, UserCircle, ChevronRight, Home } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/dashboard/upload", label: "Upload Results", icon: Upload },
  { href: "/admin/dashboard/settings", label: "System Settings", icon: Settings },
  { href: "/admin/dashboard/test-results", label: "Test Results", icon: TestTube },
  { href: "/admin/dashboard/logins", label: "Admin Logins", icon: History },
  { href: "/admin/dashboard/diffs", label: "Backup Comparison", icon: FileDiff },
  { href: "/admin/dashboard/schools", label: "Schools", icon: School },
  { href: "/admin/dashboard/admins", label: "Admins", icon: Users, superAdmin: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAdminUser()
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <>
      {/* Vertical toggle bar for mobile */}
      <button
        className="md:hidden fixed top-0 left-0 z-40 h-full w-6 bg-[hsl(var(--sidebar-accent))] border-r border-[hsl(var(--sidebar-border))] flex items-center justify-center"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        <ChevronRight className={`h-5 w-5 text-[#223152] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 top-0 left-0 min-h-full w-60 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shadow-lg
          flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex md:w-60
        `}
        style={{ minWidth: "15rem" }}
      >
        {/* User Info */}
        <div className="flex items-center gap-3 h-20 px-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))]">
          <div className="bg-[#223152] rounded-full p-2 flex items-center justify-center">
            <UserCircle className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[#223152] truncate">{profile?.full_name || user.email}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
            {profile?.is_super_admin && (
              <span className="text-xs text-yellow-600 font-bold">Super Admin</span>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className=" md:sticky md:top-0 md:left-0 flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navLinks.map(link => {
            if (link.superAdmin && !profile?.is_super_admin) return null
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors
                  ${active ? "bg-[#223152] text-white" : "text-[#223152] hover:bg-blue-50"}
                  font-medium gap-3`}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="md:sticky md:bottom-0 md:left-0 p-4 border-t border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))]">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
