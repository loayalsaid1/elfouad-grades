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
    fallback: false,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchActiveContext() {
      if (!school || !grade) {
        setContext((prev) => ({
          ...prev,
          loading: false,
          error: "School and grade are required",
        }))
        return
      }

      try {
        const response = await fetch(
          `/api/active-context?school=${encodeURIComponent(school)}&grade=${encodeURIComponent(grade)}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch active context: ${response.status}`)
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
        setContext((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }))
      }
    }

    fetchActiveContext()
  }, [school, grade])

  return context
}
