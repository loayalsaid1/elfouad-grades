import { useEffect, useState } from "react"
import type { AcademicContext } from "@/hooks/useSettingsPage"

export function useActiveContextChanges(contexts: AcademicContext[], activeContexts: Record<string, boolean>, loading: boolean) {
  const [initialActiveContexts, setInitialActiveContexts] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    if (!loading && Object.keys(initialActiveContexts).length === 0) {
      setInitialActiveContexts({ ...activeContexts })
    }
  }, [loading, activeContexts])

  const getContextName = (id: string) => {
    const ctx = contexts.find((c) => c.id == id)
    if (!ctx) return id
    return `${ctx.schools?.name || "?"} - Grade ${ctx.grade} - ${ctx.year}-${ctx.year + 1} - ${ctx.term === 1 ? "First" : "Second"} Term`
  }

  const getChanges = () => {
    const result: { id: string; name: string; from: boolean; to: boolean }[] = []
    for (const id of Object.keys(activeContexts)) {
      const from = initialActiveContexts[id] || false
      const to = activeContexts[id] || false
      if (from !== to) {
        result.push({ id, name: getContextName(id), from, to })
      }
    }
    return result
  }

  const resetInitial = () => setInitialActiveContexts({ ...activeContexts })

  return { initialActiveContexts, getContextName, getChanges, resetInitial }
}
