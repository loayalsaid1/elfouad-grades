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
            <div className="space-y-4">
              {contexts.length > 0 ? (
                contexts.map((context) => (
                  <div key={context.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{context.schools?.name || "Unknown School"}</p>
                      <p className="text-sm text-gray-500">
                        Grade {context.grade} • {context.year}-{context.year + 1} • Term {context.term}
                      </p>
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
