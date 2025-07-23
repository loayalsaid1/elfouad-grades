import { useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import type { StudentResult } from "@/types/student"

export function useStudentDelete() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClientComponentSupabaseClient()

  const deleteStudent = async (
    student: StudentResult,
    context: { id: number }
  ): Promise<boolean> => {
    setPending(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error } = await supabase
        .from("student_results")
        .delete()
        .eq("student_id", student.id)
        .eq("context_id", context.id)

      if (error) throw error

      setSuccess(`Student "${student.name}" deleted successfully.`)
      return true
    } catch (err: any) {
      setError(err.message || "Failed to delete student")
      return false
    } finally {
      setPending(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return {
    deleteStudent,
    pending,
    error,
    success,
    clearMessages,
  }
}
