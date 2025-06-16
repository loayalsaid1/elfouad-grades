import { createClientComponentSupabaseClient } from "@/lib/supabase"
import type { StudentResult, PasswordRequiredError } from "@/types/student"

function matchErrorCode(error: any, code: string) {
  // Supabase may put the code in error.code, error.details, or error.message
  return (
    error?.code === code ||
    (typeof error?.details === "string" && error.details.includes(code)) ||
    (typeof error?.message === "string" && error.message.includes(code))
  )
}

export class StudentService {
  static async getStudentById(id: string, school: string, grade: number, password?: string): Promise<StudentResult> {
    const supabase = createClientComponentSupabaseClient()
    // Call the Supabase function directly
    const { data, error } = await supabase.rpc("get_student_result", {
      school_slug: school,
      input_grade: grade,
      input_student_id: id,
      input_parent_password: password ?? null,
    })

    if (error) {
      // Map error codes/messages to previous error handling
      if (matchErrorCode(error, "S40401")) {
        throw new Error("School not found")
      }
      if (matchErrorCode(error, "C40401")) {
        throw new Error("No active academic context found for this school and grade")
      }
      if (matchErrorCode(error, "ST40401")) {
        throw new Error("Student not found")
      }
      if (matchErrorCode(error, "P40101")) {
        const err = new Error("Parent password required") as Error & PasswordRequiredError
        err.requiresPassword = true
        throw err
      }
      if (matchErrorCode(error, "P40102")) {
        const err = new Error("Incorrect parent password") as Error & PasswordRequiredError
        err.requiresPassword = true
        throw err
      }
      // If error message contains "Parent password required" or "Incorrect parent password"
      if (
        typeof error.message === "string" &&
        (error.message.toLowerCase().includes("parent password required") ||
          error.message.toLowerCase().includes("incorrect parent password"))
      ) {
        const err = new Error(error.message) as Error & PasswordRequiredError
        err.requiresPassword = true
        throw err
      }
      throw new Error(error.message || "Student not found")
    }

    if (!data || data.length === 0) {
      throw new Error("Student not found")
    }

    // The function returns: [{ student_name, scores }]
    return {
      id,
      name: data[0].student_name,
      scores: Array.isArray(data[0].scores)
        ? data[0].scores
        : Object.entries(data[0].scores ?? {}).map(([subject, s]: [string, any]) => ({
            subject,
            score: s.absent ? null : s.score,
            full_mark: s.full_mark || 100,
            absent: s.absent || false,
          })),
      school,
      grade,
      requiresPassword: false,
    }
  }
}

// Named export for backward compatibility
export const getStudentById = StudentService.getStudentById
