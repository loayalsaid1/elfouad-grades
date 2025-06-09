"use client"

import { useState, useEffect } from "react"

interface ActiveContext {
  year: number
  term: number
  fallback: boolean
  loading: boolean
  error: string | null
}

export function useActiveContext(school: string, grade: string): ActiveContext {
  const [context, setContext] = useState<ActiveContext>({
    year: 0,
    term: 0,
    fallback: true,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchActiveContext() {
      try {
        // Always include fallback import
        const { CURRENT_ROUND } = await import("@/constants/currentRound")
        const fallbackContext = {
          year: CURRENT_ROUND.startYear,
          term: CURRENT_ROUND.term,
          fallback: true,
          loading: false,
          error: null,
        }

        if (!school || !grade) {
          setContext(fallbackContext)
          return
        }

        const response = await fetch(
          `/api/active-context?school=${encodeURIComponent(school)}&grade=${encodeURIComponent(grade)}`,
        )

        if (!response.ok) {
          console.log("Active context API failed, using fallback")
          setContext(fallbackContext)
          return
        }

        const data = await response.json()

        setContext({
          year: data.year,
          term: data.term,
          fallback: data.fallback || false,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching active context:", error)
        // Always fall back to currentRound on error
        const { CURRENT_ROUND } = await import("@/constants/currentRound")
        setContext({
          year: CURRENT_ROUND.startYear,
          term: CURRENT_ROUND.term,
          fallback: true,
          loading: false,
          error: null,
        })
      }
    }

    fetchActiveContext()
  }, [school, grade])

  return context
}
