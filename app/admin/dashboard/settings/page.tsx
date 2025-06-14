"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Settings, AlertCircle, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemEnabled, setSystemEnabled] = useState(true)
  const [contexts, setContexts] = useState([])
  const [activeContexts, setActiveContexts] = useState({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Filter state
  const [filterYear, setFilterYear] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterTerm, setFilterTerm] = useState("")
  const [filterSchool, setFilterSchool] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // Fetch system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", "system_enabled")
        .single()

      if (settingsData) {
        setSystemEnabled(settingsData.value?.enabled !== false)
      }

      // Fetch academic contexts with school names
      const { data: contextsData, error: contextsError } = await supabase
        .from("academic_contexts")
        .select(`
          id,
          year,
          term,
          grade,
          is_active,
          schools (
            name
          )
        `)
        .order("year", { ascending: false })
        .order("term")
        .order("grade")

      if (contextsError) throw contextsError

      setContexts(contextsData || [])

      // Create active contexts map
      const activeMap = {}
      contextsData?.forEach((context) => {
        activeMap[context.id] = context.is_active || false
      })
      setActiveContexts(activeMap)
    } catch (err) {
      setError("Failed to load settings: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError("")
      setMessage("")

      // Update system settings
      const { error: systemError } = await supabase.from("system_settings").upsert({
        key: "system_enabled",
        value: { enabled: systemEnabled },
      }, {onConflict: 'key'});

      if (systemError) throw systemError

      // Update active contexts
      for (const [contextId, isActive] of Object.entries(activeContexts)) {
        const { error: contextError } = await supabase
          .from("academic_contexts")
          .update({ is_active: isActive })
          .eq("id", contextId)

        if (contextError) throw contextError
      }

      setMessage("Settings saved successfully!")
    } catch (err) {
      setError("Failed to save settings: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleContext = (contextId, active) => {
    setActiveContexts((prev) => ({
      ...prev,
      [contextId]: active,
    }))
  }

  // Get unique filter options from contexts
  const schoolOptions = Array.from(new Set(contexts.map((c: any) => c.schools?.name).filter(Boolean)))
  const yearOptions = Array.from(new Set(contexts.map((c: any) => c.year))).sort((a, b) => b - a)
  const gradeOptions = Array.from(new Set(contexts.map((c: any) => c.grade))).sort((a, b) => a - b)
  const termOptions = Array.from(new Set(contexts.map((c: any) => c.term))).sort()

  // Filtered contexts
  const filteredContexts = contexts.filter((context: any) => {
    return (
      (!filterSchool || context.schools?.name === filterSchool) &&
      (!filterYear || context.year === Number(filterYear)) &&
      (!filterGrade || context.grade === Number(filterGrade)) &&
      (!filterTerm || context.term === Number(filterTerm))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage system availability and active academic contexts</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Availability</CardTitle>
            <CardDescription>Control whether students can access the results system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="system-enabled" checked={systemEnabled} onCheckedChange={setSystemEnabled} />
              <Label htmlFor="system-enabled">System is {systemEnabled ? "enabled" : "disabled"}</Label>
            </div>
            {!systemEnabled && (
              <p className="text-sm text-amber-600 mt-2">⚠️ When disabled, students will see a maintenance message</p>
            )}
          </CardContent>
        </Card>

        {/* Active Contexts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Academic Contexts</CardTitle>
            <CardDescription>
              Set which academic periods are currently active. Students will see results for active contexts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterSchool}
                  onChange={e => setFilterSchool(e.target.value)}
                >
                  <option value="">All</option>
                  {schoolOptions.map((school) => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value)}
                >
                  <option value="">All</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}-{Number(year)+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value)}
                >
                  <option value="">All</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Term</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterTerm}
                  onChange={e => setFilterTerm(e.target.value)}
                >
                  <option value="">All</option>
                  {termOptions.map((term) => (
                    <option key={term} value={term}>{term === 1 ? "First" : "Second"} Term</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Contexts List */}
            <div className="space-y-4">
              {filteredContexts.length > 0 ? (
                filteredContexts.map((context: any) => (
                  <div
                    key={context.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900">{context.schools?.name || "Unknown School"}</span>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                          {context.year}-{context.year + 1}
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                          Grade {context.grade}
                        </span>
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
                          {context.term === 1 ? "First" : "Second"} Term
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={activeContexts[context.id] || false}
                      onCheckedChange={(checked) => toggleContext(context.id, checked)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No academic contexts found. Upload some student results first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
