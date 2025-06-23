import { useCallback, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"

export interface UploadContext {
  school_id: number
  year: number
  term: number
  grade: number
}

function termToString(term: number) {
  return term === 1 ? "t1" : "t2"
}

async function fetchSchoolSlug(school_id: number): Promise<string | null> {
  const supabase = createClientComponentSupabaseClient()
  const { data, error } = await supabase
    .from("schools")
    .select("slug")
    .eq("id", school_id)
    .single()
  if (error || !data) return null
  return data.slug
}

export function useCSVBackupUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const uploadCSVBackup = useCallback(
    async (file: File, context: UploadContext) => {
      setUploading(true)
      setError(null)
      setSuccess(null)
      try {
        const schoolSlug = await fetchSchoolSlug(context.school_id)
        if (!schoolSlug) {
          setError("Failed to fetch school slug for backup.")
          return { success: false, error: "Failed to fetch school slug for backup." }
        }
        const supabase = createClientComponentSupabaseClient()
        const path = `${schoolSlug}/${context.year}/${termToString(context.term)}/grade_${context.grade}.csv`
        const { error: uploadError } = await supabase.storage
          .from("student-results-csv-backups")
          .upload(path, file, { upsert: true, contentType: "text/csv" })
        if (uploadError) {
          setError(`Backup upload failed: ${uploadError.message}`)
          return { success: false, error: uploadError.message }
        }
        setSuccess("Backup uploaded to Supabase successfully.")
        return { success: true }
      } catch (err: any) {
        setError("Backup upload failed: " + (err?.message || "Unknown error"))
        return { success: false, error: err?.message || "Unknown error" }
      } finally {
        setUploading(false)
      }
    },
    []
  )

  return { uploadCSVBackup, uploading, error, success }
}
