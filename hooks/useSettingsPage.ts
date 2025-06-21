import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"

export interface AcademicContext {
  id: string
  year: number
  term: number
  grade: number
  is_active: boolean
  school_id: string
  schools?: { name: string }
}

export interface SettingsPageFilters {
  year: string
  grade: string
  term: string
  school: string
}

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
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [systemEnabled, setSystemEnabled] = useState<boolean>(true)
  const [contexts, setContexts] = useState<AcademicContext[]>([])
  const [activeContexts, setActiveContexts] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [filters, setFilters] = useState<SettingsPageFilters>({
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
      // Fetch academic contexts with school names and school_id
      const { data: contextsData, error: contextsError } = await supabase
        .from("academic_contexts")
        .select(`
          id,
          year,
          term,
          grade,
          is_active,
          school_id,
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
      const activeMap: Record<string, boolean> = {}
      contextsData?.forEach((context: AcademicContext) => {
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

      // Prepare updates array for RPC
      const updates = contexts.map((context: AcademicContext) => ({
        id: context.id,
        is_active: activeContexts[context.id] || false,
      }))

      // Call the RPC to update all contexts in a transaction
      const { error: rpcError } = await supabase.rpc("bulk_update_contexts_is_active", {
        updates
      })
      if (rpcError) throw rpcError

      setMessage("Settings saved successfully!")
    } catch (err: any) {
      setError("Failed to save settings: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteContext = async (contextId: string) => {
    try {
      setSaving(true)
      setError("")
      await supabase.from("academic_contexts").delete().eq("id", contextId)
      setContexts((prev) => prev.filter((c) => c.id !== contextId))
      setActiveContexts((prev) => {
        const updated = { ...prev }
        delete updated[contextId]
        return updated
      })
      setMessage("Academic context deleted.")
    } catch (err: any) {
      setError("Failed to delete context: " + err.message)
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
    deleteContext,
  }
}
