import type { StudentResult, PasswordRequiredError } from "@/types/student"

export class StudentService {
  static async getStudentById(id: string, school: string, grade: number, password?: string): Promise<StudentResult> {
    const url = new URL(`/api/results/${school}/${grade}/${id}`, window.location.origin)
    if (password) {
      url.searchParams.set("password", password)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorData = await response.json()

      // Handle password required error specifically
      if (errorData.requiresPassword) {
        const error = new Error(errorData.error) as Error & PasswordRequiredError
        error.requiresPassword = true
        throw error
      }

      throw new Error(errorData.error || "Student not found")
    }

    return response.json()
  }
}

// Named export for the function
export const getStudentById = StudentService.getStudentById
