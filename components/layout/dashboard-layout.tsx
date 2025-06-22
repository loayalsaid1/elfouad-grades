"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { LayoutDashboard, Upload, School, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentSupabaseClient()

  const routes = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Upload Results",
      icon: <Upload className="h-5 w-5" />,
      href: "/dashboard/upload",
      active: pathname === "/dashboard/upload",
    },
    {
      label: "Schools & Contexts",
      icon: <School className="h-5 w-5" />,
      href: "/dashboard/schools",
      active: pathname === "/dashboard/schools",
    },
    {
      label: "System Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Close mobile sidebar when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Toggle */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden fixed left-4 top-4 z-10">
          <Button variant="outline" size="icon" className="shadow-lg bg-white hover:bg-[#223152] hover:text-white transition-all duration-300">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <MobileSidebar routes={routes} onSignOut={handleSignOut} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r bg-white shadow-xl">
        <DesktopSidebar routes={routes} onSignOut={handleSignOut} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

interface SidebarProps {
  routes: {
    label: string
    icon: React.ReactNode
    href: string
    active: boolean
  }[]
  onSignOut: () => void
}

function MobileSidebar({ routes, onSignOut }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white">
        <h2 className="text-2xl font-bold">Admin Portal</h2>
        <p className="text-sm opacity-90 mt-1">El Fouad Schools Group</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-6">
        <nav className="flex flex-col gap-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              className={`justify-start transition-all duration-300 ${
                route.active 
                  ? "bg-[#223152] text-white shadow-md" 
                  : "hover:bg-[#223152] hover:text-white hover:shadow-lg hover:scale-[1.02]"
              }`}
              asChild
            >
              <a href={route.href}>
                {route.icon}
                <span className="ml-2">{route.label}</span>
              </a>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-6">
        <Button 
          variant="outline" 
          className="w-full justify-start hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300" 
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebar({ routes, onSignOut }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white">
        <h2 className="text-2xl font-bold">Admin Portal</h2>
        <p className="text-sm opacity-90 mt-1">El Fouad Schools Group</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-6">
        <nav className="flex flex-col gap-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              className={`justify-start transition-all duration-300 ${
                route.active 
                  ? "bg-[#223152] text-white shadow-md" 
                  : "hover:bg-[#223152] hover:text-white hover:shadow-lg hover:scale-[1.02]"
              }`}
              asChild
            >
              <a href={route.href}>
                {route.icon}
                <span className="ml-2">{route.label}</span>
              </a>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-6">
        <Button 
          variant="outline" 
          className="w-full justify-start hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300" 
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
