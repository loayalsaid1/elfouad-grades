"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [systemEnabled, setSystemEnabled] = useState(true)
  const [activeContexts, setActiveContexts] = useState<Record<string, boolean>>({})
  const [contexts, setContexts] = useState<any[]>([])

  const supabase = createClientComponentSupabaseClient()

  // Fetch settings and contexts on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)

        // Fetch system settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("system_settings")
          .select("*")
          .eq("key", "system_status")
          .single()

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError
        }

        if (settingsData) {
          setSystemEnabled(settingsData.value.enabled !== false)
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
              id,
              name
            )
          `)
          .order("year", { ascending: false })
          .order("term")
          .order("grade")

        if (contextsError) {
          throw contextsError
        }

        setContexts(contextsData || [])

        // Create a map of active contexts
        const activeMap: Record<string, boolean> = {}
        contextsData?.forEach((context) => {
          activeMap[context.id] = context.is_active || false
        })
        setActiveContexts(activeMap)
      } catch (err: any) {
        setError(`Failed to load settings: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSystemToggle = (enabled: boolean) => {
    setSystemEnabled(enabled)
  }

  const handleContextToggle = (contextId: number, active: boolean) => {
    setActiveContexts((prev) => ({
      ...prev,
      [contextId]: active,
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Update system status
      const { error: systemError } = await supabase.from("system_settings").upsert({
        key: "system_status",
        value: { enabled: systemEnabled },
      })

      if (systemError) throw systemError

      // Update active contexts
      for (const [contextId, isActive] of Object.entries(activeContexts)) {
        const { error: contextError } = await supabase
          .from("academic_contexts")
          .update({ is_active: isActive })
          .eq("id", contextId)

        if (contextError) throw contextError
      }

      setSuccess(true)
    } catch (err: any) {
      setError(`Failed to save settings: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Availability</CardTitle>
          <CardDescription>Control whether the student results system is available to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch checked={systemEnabled} onCheckedChange={handleSystemToggle} id="system-status" />
            <Label htmlFor="system-status">System is {systemEnabled ? "enabled" : "disabled"}</Label>
          </div>
          {!systemEnabled && (
            <p className="text-sm text-amber-600 mt-2">
              Warning: When disabled, students will not be able to access their results
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Academic Contexts</CardTitle>
          <CardDescription>Set which academic periods are currently active in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contexts.length > 0 ? (
              contexts.map((context) => (
                <div key={context.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{context.schools?.name}</p>
                    <p className="text-sm text-gray-500">
                      Grade {context.grade}, {context.year}-{context.year + 1},
                      {context.term === 1 ? " First" : " Second"} Term
                    </p>
                  </div>
                  <Switch
                    checked={activeContexts[context.id] || false}
                    onCheckedChange={(checked) => handleContextToggle(context.id, checked)}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No academic contexts found</p>
            )}
          </div>
        </CardContent>
      </Card>

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
  )
}
