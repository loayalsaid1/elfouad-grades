"use client"

import { useEffect, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users } from "lucide-react"
import BackToDashboard from "@/components/admin/BackToDashboard"
import { useAdminUser } from "@/hooks/useAdminUser"
import LoadingPage from "@/components/admin/LoadingPage"

export default function AdminLoginsPage() {
  const user = useAdminUser()
  const [logins, setLogins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    const fetchLogins = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from("admin_logins")
          .select("id, email, created_at, ip_address, user_agent, latitude, longitude")
          .order("created_at", { ascending: false })
          .limit(20)
        if (error) throw error
        setLogins(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to load logins")
      } finally {
        setLoading(false)
      }
    }
    fetchLogins()
  }, [supabase])

  if (!user) return <LoadingPage message="Loading logins..." />

  return (
    <div className="h-full bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3" />
            Latest Admin Logins
          </h1>
          <p className="text-gray-600 mt-2">Recent admin login activity</p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Recent Logins</CardTitle>
            <CardDescription>Last 20 admin login events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">IP Address</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">User Agent</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Latitude</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">No logins found</td>
                      </tr>
                    ) : (
                      logins.map((login) => (
                        <tr key={login.id} className="border-b">
                          <td className="px-4 py-2 text-sm">{login.email}</td>
                          <td className="px-4 py-2 text-sm">{new Date(login.created_at).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">{login.ip_address || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-4 py-2 text-xs max-w-xs truncate" title={login.user_agent}>{login.user_agent || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-4 py-2 text-xs">{login.latitude !== null ? login.latitude : <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-4 py-2 text-xs">{login.longitude !== null ? login.longitude : <span className="text-gray-400 italic">N/A</span>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
