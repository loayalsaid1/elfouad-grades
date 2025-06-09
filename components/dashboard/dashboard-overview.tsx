"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, School, Users, BookOpen, Calendar } from "lucide-react"

export function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalContexts: 0,
    activeContexts: 0,
    recentUploads: [] as any[],
  })

  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Get schools count
        const { count: schoolsCount, error: schoolsError } = await supabase
          .from("schools")
          .select("*", { count: "exact", head: true })

        if (schoolsError) throw schoolsError

        // Get contexts count
        const { count: contextsCount, error: contextsError } = await supabase
          .from("academic_contexts")
          .select("*", { count: "exact", head: true })

        if (contextsError) throw contextsError

        // Get active contexts count
        const { count: activeContextsCount, error: activeContextsError } = await supabase
          .from("academic_contexts")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        if (activeContextsError) throw activeContextsError

        // Get students count
        const { count: studentsCount, error: studentsError } = await supabase
          .from("student_results")
          .select("*", { count: "exact", head: true })

        if (studentsError) throw studentsError

        // Get recent uploads (distinct contexts with latest upload date)
        const { data: recentUploads, error: uploadsError } = await supabase
          .from("student_results")
          .select(`
            id,
            created_at,
            context_id,
            academic_contexts (
              year,
              term,
              grade,
              schools (
                name
              )
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (uploadsError) throw uploadsError

        setStats({
          totalSchools: schoolsCount || 0,
          totalStudents: studentsCount || 0,
          totalContexts: contextsCount || 0,
          activeContexts: activeContextsCount || 0,
          recentUploads: recentUploads || [],
        })
      } catch (err: any) {
        setError(`Failed to load dashboard data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading dashboard data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-gray-500 mt-1">Schools in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">Student records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Academic Contexts</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContexts}</div>
            <p className="text-xs text-gray-500 mt-1">Total academic periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Contexts</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContexts}</div>
            <p className="text-xs text-gray-500 mt-1">Currently active periods</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest result uploads in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="uploads">
            <TabsList className="mb-4">
              <TabsTrigger value="uploads">Recent Uploads</TabsTrigger>
            </TabsList>
            <TabsContent value="uploads">
              <div className="space-y-4">
                {stats.recentUploads.length > 0 ? (
                  stats.recentUploads.map((upload) => (
                    <div key={upload.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{upload.academic_contexts?.schools?.name}</p>
                        <p className="text-sm text-gray-500">
                          Grade {upload.academic_contexts?.grade},
                          {upload.academic_contexts?.term === 1 ? " First" : " Second"} Term,
                          {upload.academic_contexts?.year}-{upload.academic_contexts?.year + 1}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(upload.created_at).toLocaleDateString()}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent uploads found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
