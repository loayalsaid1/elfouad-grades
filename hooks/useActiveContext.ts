"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase" // adjust path if needed

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
        setContext({
          year: 0,
          term: 0,
          fallback: false,
          loading: false,
          error: "School and grade are required",
        })
        return
      }

      try {
        const supabase = createClientComponentSupabaseClient()
        // grade is string, convert to int
        const gradeInt = Number.parseInt(grade)
        if (isNaN(gradeInt)) {
          throw new Error("Invalid grade")
        }
        const { data, error } = await supabase
          .rpc("get_active_context", { school_slug: school, input_grade: gradeInt })

        if (error) {
          throw new Error(error.message)
        }

        if (!data || data.length === 0) {
          throw new Error("No active academic context found")
        }

        setContext({
          year: data[0].year,
          term: data[0].term,
          fallback: false,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching active context:", error)
        setContext({
          year: 0,
          term: 0,
          fallback: false,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch active context",
        })
      }
    }

    fetchActiveContext()
  }, [school, grade])

  return context
}
