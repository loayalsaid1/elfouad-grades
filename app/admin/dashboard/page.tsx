"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Settings, School, Users, Database, LogOut } from "lucide-react"
import { useAdminUser } from "@/hooks/useAdminUser"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import LoadingPage from "@/components/admin/LoadingPage"

export default function AdminDashboard() {
  const user = useAdminUser()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSchools: 0,
    activeContexts: 0,
    systemStatus: "enabled",
  })
  const [lastLogin, setLastLogin] = useState<null | {
    created_at: string;
    ip_address: string | null;
    latitude: number | null;
    longitude: number | null;
  }>(null)
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    if (user) {
      loadStats()
      fetchLastLogin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadStats = async () => {
    try {
      // Get total schools
      const { count: schoolCount } = await supabase.from("schools").select("*", { count: "exact", head: true })

      // Get total students (from your existing CSV data)
      const { count: studentCount } = await supabase.from("distinct_students").select("*", { count: "exact", head: true });

      // Get active contexts
      const { count: activeCount } = await supabase
        .from("academic_contexts")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // Fetch system_enabled status
      const { data: systemSetting } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "system_enabled")
        .single()

      const systemEnabled = systemSetting?.value?.enabled !== false

      setStats({
        totalStudents: studentCount || 0,
        totalSchools: schoolCount || 2,
        activeContexts: activeCount || 0,
        systemStatus: systemEnabled ? "enabled" : "disabled",
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const fetchLastLogin = async () => {
    // Fetch the last two logins for this user, show the second one if it exists
    const { data } = await supabase
      .from("admin_logins")
      .select("created_at, ip_address, latitude, longitude")
      .order("created_at", { ascending: false })
      .limit(2)
    if (data && data.length === 2) {
      setLastLogin(data[1])
    } else {
      setLastLogin(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!user) return <LoadingPage message="Loading dashboard..." />

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">El Fouad Schools Group</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.email}</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contexts</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContexts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <div
                className={`h-2 w-2 rounded-full ${stats.systemStatus === "enabled" ? "bg-green-500" : "bg-red-500"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{stats.systemStatus}</div>
            </CardContent>
          </Card>

          {/* Previous Login Card */}
          {lastLogin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previous Login</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-700">
                  <div><span className="font-semibold">Date:</span> {new Date(lastLogin.created_at).toLocaleString()}</div>
                  <div><span className="font-semibold">IP:</span> {lastLogin.ip_address || <span className="italic text-gray-400">N/A</span>}</div>
                  <div><span className="font-semibold">Location:</span> {lastLogin.latitude !== null && lastLogin.longitude !== null ? `${lastLogin.latitude}, ${lastLogin.longitude}` : <span className="italic text-gray-400">N/A</span>}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/admin/dashboard/upload")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Results
              </CardTitle>
              <CardDescription>Upload CSV files with student results</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Upload</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/admin/dashboard/settings")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>Manage system configuration and active contexts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Settings
              </Button>
            </CardContent>
          </Card>

          {/* New: Test Student Results Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/admin/dashboard/test-results")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Test Student Results
              </CardTitle>
              <CardDescription>
                Search and view student results as a normal user would
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Test Results
              </Button>
            </CardContent>
          </Card>

          {/* Latest Logins Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/admin/dashboard/logins")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Latest Logins
              </CardTitle>
              <CardDescription>View recent admin login activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Logins
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
