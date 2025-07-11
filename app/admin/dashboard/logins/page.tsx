"use client"

import { useEffect, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users } from "lucide-react"
import BackToDashboard from "@/components/admin/BackToDashboard"
import { useAdminUser } from "@/hooks/useAdminUser"
import LoadingPage from "@/components/admin/LoadingPage"
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns"

type LoginRecord = {
  id: string
  email: string
  created_at: string
  ip_address: string | null
  user_agent: string | undefined
  latitude: number | null
  longitude: number | null
}

type FilterType = "24h" | "7d" | "30d" | "year" | "all" | "custom"

function getFilterLabel(filter: FilterType, customStart: string, customEnd: string): string {
  switch (filter) {
    case "24h":
      return "Last 24 hours"
    case "7d":
      return "Last 7 days"
    case "30d":
      return "Last 30 days"
    case "year":
      return "Last year"
    case "all":
      return "All logins"
    case "custom":
      if (customStart && customEnd) {
        return `Custom range: ${customStart} to ${customEnd}`
      }
      return "Custom range"
    default:
      return ""
  }
}

export default function AdminLoginsPage() {
  const user = useAdminUser()
  const [logins, setLogins] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("7d")
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")
  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    const fetchLogins = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from("admin_logins")
          .select("id, email, created_at, ip_address, user_agent, latitude, longitude")
          .order("created_at", { ascending: false })

        let fromDate: Date | null = null
        let toDate: Date | null = null

        if (filter === "24h") {
          fromDate = subDays(new Date(), 1)
        } else if (filter === "7d") {
          fromDate = subDays(new Date(), 7)
        } else if (filter === "30d") {
          fromDate = subMonths(new Date(), 1)
        } else if (filter === "year") {
          fromDate = subYears(new Date(), 1)
        } else if (filter === "custom" && customStart && customEnd) {
          fromDate = new Date(customStart)
          toDate = new Date(customEnd)
        }

        if (fromDate) {
          query = query.gte("created_at", fromDate.toISOString())
        }
        if (toDate) {
          const end = new Date(toDate)
          end.setDate(end.getDate() + 1)
          query = query.lt("created_at", end.toISOString())
        }

        const { data, error } = await query
        if (error) throw error
        setLogins((data as LoginRecord[]) || [])
      } catch (err: any) {
        setError(err.message || "Failed to load logins")
      } finally {
        setLoading(false)
      }
    }
    fetchLogins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, filter, customStart, customEnd])

  if (!user) return <LoadingPage message="Loading logins..." />

  return (
      <div className="max-w-6xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 sm:p-3 rounded-full mr-2 sm:mr-4 flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            Admin Logins
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">View admin login activity for the selected period</p>
        </div>

        {/* Time Filter UI */}
        <Card className="mb-4 sm:mb-6 shadow-lg border-2 hover:border-[#223152] transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              <label className="font-medium text-[#223152] text-sm sm:text-base">Show:</label>
              <select
                className="border-2 border-gray-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300 text-xs sm:text-sm"
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="year">Last year</option>
                <option value="all">All</option>
                <option value="custom">Custom range</option>
              </select>
              {filter === "custom" && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    className="border-2 border-gray-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300 text-xs sm:text-sm"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    max={customEnd || undefined}
                  />
                  <span className="mx-1 sm:mx-2 text-gray-500 font-medium text-xs sm:text-sm">to</span>
                  <input
                    type="date"
                    className="border-2 border-gray-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300 text-xs sm:text-sm"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    min={customStart || undefined}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-white text-base sm:text-lg">Admin Logins ({getFilterLabel(filter, customStart, customEnd)})</CardTitle>
            <CardDescription className="text-blue-100 text-xs sm:text-sm mt-1">
              Admin Login Activity - {getFilterLabel(filter, customStart, customEnd)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-4 sm:p-8">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#223152]" />
              </div>
            ) : (
              <div className="overflow-x-auto sm:mx-0">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-[#223152] uppercase tracking-wider">Email</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-[#223152] uppercase tracking-wider">Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-[#223152] uppercase tracking-wider">IP Address</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-[#223152] uppercase tracking-wider">User Agent</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs font-semibold text-[#223152] uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 sm:py-12 text-gray-500">
                          <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 sm:h-12 sm:w-12 opacity-50 mb-2 sm:mb-4" />
                            <p className="text-base sm:text-lg font-medium">No logins found</p>
                            <p className="text-xs sm:text-sm">for the selected time period</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logins.map((login, index) => (
                        <tr key={login.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-[#223152]">{login.email}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700">{new Date(login.created_at).toLocaleString()}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700">{login.ip_address || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-xs text-gray-600 max-w-[100px] sm:max-w-xs truncate" title={login.user_agent}>{login.user_agent || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-xs text-gray-600">
                            {login.latitude !== null && login.longitude !== null 
                              ? <span className="inline-flex items-center text-[10px] sm:text-xs bg-blue-50 text-blue-800 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full">{login.latitude.toFixed(4)}, {login.longitude.toFixed(4)}</span>
                              : <span className="text-gray-400 italic">N/A</span>
                            }
                          </td>
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
  )
}
