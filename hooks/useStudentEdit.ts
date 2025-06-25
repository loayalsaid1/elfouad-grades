import { useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import type { StudentResult } from "@/types/student"

export function useStudentEdit() {
  const [editing, setEditing] = useState<StudentResult | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClientComponentSupabaseClient()

  const startEdit = (student: StudentResult) => {
    setEditing(student)
    setError(null)
    setSuccess(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setError(null)
    setSuccess(null)
  }

  const saveEdit = async (
    updated: StudentResult,
    context: { id: number }
  ) => {
    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      // Prepare scores for DB (convert to expected JSON structure)
      const scores = updated.scores.map(s => ({
        subject: s.subject,
        score: s.absent ? null : (s.score !== null && s.score !== "" ? parseFloat(s.score) : null),
        full_mark: s.full_mark,
        absent: !!s.absent,
      }))
      // If student ID changed, update the row with the old ID, then set the new ID
      if (editing && updated.id !== editing.id) {
        // Update the row with the old ID, set new ID
        const { error } = await supabase
          .from("student_results")
          .update({
            student_id: updated.id,
            student_name: updated.name,
            scores,
          })
          .eq("student_id", editing.id)
          .eq("context_id", context.id)
        if (error) throw error
      } else {
        // Normal update
        const { error } = await supabase
          .from("student_results")
          .update({
            student_name: updated.name,
            scores,
          })
          .eq("student_id", updated.id)
          .eq("context_id", context.id)
        if (error) throw error
      }
      setSuccess("Student updated successfully.")
      setEditing(null)
      return true
    } catch (err: any) {
      setError(err.message || "Failed to update student")
      return false
    } finally {
      setPending(false)
    }
  }

  return {
    editing,
    startEdit,
    cancelEdit,
    saveEdit,
    pending,
    error,
    success,
  }
}
