import { useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import Papa from "papaparse"

export function useContextStudentsExport() {
  const supabase = createClientComponentSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // context: { id, year, term, grade, school_id, ... }
  const exportContextCSV = async (context: { id: number, year: number, term: number, grade: number, school_id: number, school_name?: string }) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc("get_context_students_and_subjects", { input_context_id: context.id })
      if (rpcError) throw rpcError

      const students = data.students as any[]
      // subjects is now array of { subject, full_mark }
      const subjects: { subject: string, full_mark: number }[] = data.subjects || []

      // Compose CSV rows
      const headers = ["id", "student_name", "parent_password", ...subjects.map(s => s.subject)]
      const fullMarksRow = ["", "", "", ...subjects.map(s => s.full_mark ?? "")]

      const rows = students.map((student) => {
        const scoreMap: Record<string, any> = {}
        for (const s of student.scores) {
          scoreMap[s.subject] = s
        }
        return [
          student.student_id,
          student.student_name,
          student.parent_password ?? "",
          ...subjects.map(({ subject }) => {
            const scoreObj = scoreMap[subject]
            if (!scoreObj) return "N/A"
            if (scoreObj.absent) return "-"
            return scoreObj.score ?? ""
          }),
        ]
      })

      const csvData = [headers, fullMarksRow, ...rows]
      const csv = Papa.unparse(csvData)
      // Download
      const blob = new Blob([csv], { type: "text/csv" })
      const filename = `context_${context.school_name || context.school_id}_grade${context.grade}_y${context.year}_t${context.term}.csv`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || "Export failed")
    } finally {
      setLoading(false)
    }
  }

  return { exportContextCSV, loading, error }
}
