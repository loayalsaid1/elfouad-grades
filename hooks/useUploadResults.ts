import { useState, useCallback } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"

interface ParsedStudent {
  student_id: string
  student_name: string
  parent_password: string | null
  scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[]
}

interface UploadContext {
  school_id: number
  year: number
  term: number
  grade: number
}

interface UseUploadResultsReturn {
  loading: boolean
  uploadResults: (students: ParsedStudent[], context: UploadContext) => Promise<string>
}

export function useUploadResults(): UseUploadResultsReturn {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentSupabaseClient()

  const uploadResults = useCallback(async (students: ParsedStudent[], context: UploadContext): Promise<string> => {
    setLoading(true)

    try {
      // Create or get academic context
      const { data: existingContext, error: contextError } = await supabase
        .from("academic_contexts")
        .select("id")
        .eq("school_id", context.school_id)
        .eq("year", context.year)
        .eq("term", context.term)
        .eq("grade", context.grade)
        .maybeSingle()

      let contextId: number

      if (existingContext) {
        contextId = existingContext.id
      } else {
        const { data: newContext, error: createError } = await supabase
          .from("academic_contexts")
          .insert({
            school_id: context.school_id,
            year: context.year,
            term: context.term,
            grade: context.grade,
          })
          .select("id")
          .single()

        if (createError) throw createError
        contextId = newContext.id
      }

      // Fetch all existing student_ids for this context
      const { data: existingStudents, error: checkError } = await supabase
        .from("student_results")
        .select("student_id")
        .eq("context_id", contextId)

      if (checkError) throw checkError

      const existingStudentIds = new Set(existingStudents?.map((s) => s.student_id) || [])
      const uploadedStudentIds = new Set(students.map((s) => s.student_id))

      // Determine which students are new, updated, and which to delete
      const newStudents = students.filter((s) => !existingStudentIds.has(s.student_id))
      const updatedStudents = students.filter((s) => existingStudentIds.has(s.student_id))
      const studentsToDelete = Array.from(existingStudentIds).filter((id) => !uploadedStudentIds.has(id))

      // Delete students not in the uploaded file
      let deletedCount = 0
      if (studentsToDelete.length > 0) {
        const { error: deleteError, count } = await supabase
          .from("student_results")
          .delete({ count: "exact" })
          .eq("context_id", contextId)
          .in("student_id", studentsToDelete)
        if (deleteError) throw deleteError
        deletedCount = count ?? studentsToDelete.length
      }

      // Prepare student results data
      const studentResults = students.map((student) => ({
        student_id: student.student_id,
        student_name: student.student_name,
        parent_password: student.parent_password,
        context_id: contextId,
        scores: student.scores,
      }))

      // Upsert student results (insert or update on conflict)
      const { error: upsertError } = await supabase
        .from("student_results")
        .upsert(studentResults, { onConflict: "student_id,context_id" })

      if (upsertError) throw upsertError

      // Count absent entries for reporting (for all students)
      const totalAbsent = students.reduce((count, student) => {
        return count + Object.values(student.scores).filter((score) => score.absent).length
      }, 0)

      return `Saved ${studentResults.length} student results! (${newStudents.length} inserted, ${updatedStudents.length} updated, ${deletedCount} deleted, ${totalAbsent} absent entries)`
    } catch (error: any) {
      console.error("Save error:", error)
      throw new Error(`Error saving data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    uploadResults,
  }
}
