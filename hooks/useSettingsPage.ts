import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"

/**
 * A custom hook to manage system settings and active academic contexts.
 *
 * @returns {object} An object containing:
 * - `loading`: A boolean indicating if the settings are currently being loaded.
 * - `saving`: A boolean indicating if the settings are currently being saved.
 * - `systemEnabled`: A boolean indicating if the system is enabled.
 * - `setSystemEnabled`: A function to update the `systemEnabled` state.
 * - `contexts`: An array of academic contexts fetched from the database.
 * - `activeContexts`: An object mapping context IDs to their active state.
 * - `setActiveContexts`: A function to update the `activeContexts` state.
 * - `message`: A string containing any success message.
 * - `error`: A string containing any error message.
 * - `filters`: An object containing filter criteria for contexts.
 * - `setFilters`: A function to update the `filters` state.
 * - `handleSaveSettings`: A function to save the current settings and active contexts.
 */

export function useSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemEnabled, setSystemEnabled] = useState(true)
  const [contexts, setContexts] = useState<any[]>([])
  const [activeContexts, setActiveContexts] = useState<{[key: string]: boolean}>({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    year: "",
    grade: "",
    term: "",
    school: "",
  })

  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError("")
      // Fetch system settings
      const { data: settingsData } = await supabase
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
      const activeMap: {[key: string]: boolean} = {}
      contextsData?.forEach((context: any) => {
        activeMap[context.id] = context.is_active || false
      })
      setActiveContexts(activeMap)
    } catch (err: any) {
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
      }, {onConflict: 'key'})
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
    } catch (err: any) {
      setError("Failed to save settings: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    systemEnabled,
    setSystemEnabled,
    contexts,
    activeContexts,
    setActiveContexts,
    message,
    error,
    filters,
    setFilters,
    handleSaveSettings,
  }
}
