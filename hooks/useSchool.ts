import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

type School = Database['public']['Tables']['schools']['Row'] & {
  slug?: string
  logo?: string
}

export function useSchool(schoolSlug: string) {
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    if (!schoolSlug) {
      setLoading(false)
      return
    }

    fetchSchool()
  }, [schoolSlug])

  const fetchSchool = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from("schools")
        .select("*")
        .eq("slug", schoolSlug)
        .single()

      if (supabaseError) throw supabaseError
      
      setSchool(data)
    } catch (err: any) {
      console.error("Failed to fetch school:", err.message)
      setError(err.message)
      setSchool(null)
    } finally {
      setLoading(false)
    }
  }

  return { school, loading, error, refetch: fetchSchool }
}
