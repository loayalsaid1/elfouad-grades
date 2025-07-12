"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Settings, Users, Database, LogOut, TestTube, History, FileDiff } from "lucide-react"
import { useAdminUser } from "@/hooks/useAdminUser"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import LoadingPage from "@/components/admin/LoadingPage"

export default function AdminDashboard() {
  const { user, profile } = useAdminUser()
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

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }
  }, []);

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
    <>  
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 mb-8 rounded-lg mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#223152]">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">El Fouad Schools Group Management</p>
              {/* User Info */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#223152]">{profile?.full_name || user.email}</span>
                {profile?.is_super_admin && (
                  <Badge className="bg-yellow-400 text-[#223152] border-yellow-400">Super Admin</Badge>
                )}
                <Badge variant="outline" className="px-2 py-1 text-[#223152] border-[#223152]">
                  {user.email}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 w-full sm:w-auto"
              >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Records</CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#223152]">{stats.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Total student records</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Contexts</CardTitle>
              <div className="bg-green-100 p-2 rounded-full">
                <Database className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#223152]">{stats.activeContexts}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active contexts</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">System Status</CardTitle>
              <div className={`p-2 rounded-full ${stats.systemStatus === "enabled" ? "bg-green-100" : "bg-red-100"}`}>
                <div className={`h-4 w-4 rounded-full ${stats.systemStatus === "enabled" ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#223152] capitalize">{stats.systemStatus}</div>
              <p className="text-xs text-gray-500 mt-1">System availability</p>
            </CardContent>
          </Card>

          {/* Previous Login Card */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Previous Login</CardTitle>
              <div className="bg-purple-100 p-2 rounded-full">
                <History className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {lastLogin ? (
                <div className="text-xs text-gray-700 space-y-1">
                  <div><span className="font-semibold">Date:</span> {new Date(lastLogin.created_at).toLocaleDateString()}</div>
                  <div><span className="font-semibold">IP:</span> {lastLogin.ip_address || <span className="italic text-gray-400">N/A</span>}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No previous logins found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/upload")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-blue-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <Upload className="h-5 w-5" />
                  </div>
                  Upload Results
                </CardTitle>
                <CardDescription>Upload CSV files with student results</CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button className="w-full bg-[#223152] hover:bg-[#1a2642] text-white transition-all duration-300">
                  Start Upload
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/settings")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-green-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <Settings className="h-5 w-5" />
                  </div>
                  System Settings
                </CardTitle>
                <CardDescription>Manage system configuration and active contexts</CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                  Open Settings
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/test-results")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-purple-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <TestTube className="h-5 w-5" />
                  </div>
                  Test Student Results
                </CardTitle>
                <CardDescription>
                  Search and view student results as a normal user would
                </CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                  Open Test Results
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/logins")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-red-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <History className="h-5 w-5" />
                  </div>
                  Latest Logins
                </CardTitle>
                <CardDescription>View recent admin login activity</CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                  View Logins
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/diffs")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-yellow-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <FileDiff className="h-5 w-5" />
                  </div>
                  Backup vs Database Comparison
                </CardTitle>
                <CardDescription>
                  Analyze differences between the uploaded backup file and the current database records for student results.
                </CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                  Open Data Comparison
                </Button>
              </CardContent>
            </Card>

            
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
              onClick={() => router.push("/admin/dashboard/schools")}
            >
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                  <div className="bg-orange-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                    <Users className="h-5 w-5" />
                  </div>
                  Schools Management
                </CardTitle>
                <CardDescription>Manage schools, including their details and logos</CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardContent>
                <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                  Manage Schools
                </Button>
              </CardContent>
            </Card>

            {/* Add Manage Admins card for super admins only */}
            {profile?.is_super_admin && (
              <Card
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#223152] group h-full flex flex-col"
                onClick={() => router.push("/admin/dashboard/admins")}
              >
                <CardHeader className="flex-grow">
                  <CardTitle className="flex items-center text-[#223152] group-hover:text-[#1a2642]">
                    <div className="bg-yellow-100 p-3 rounded-full mr-3 group-hover:bg-[#223152] group-hover:text-white transition-all duration-300">
                      <Users className="h-5 w-5" />
                    </div>
                    Manage Admins
                  </CardTitle>
                  <CardDescription>View and manage admin users and their school access</CardDescription>
                </CardHeader>
                <div className="flex-grow" />
                <CardContent>
                  <Button variant="outline" className="w-full border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300">
                    Manage Admins
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
      </main>
    </>
  )
}
