import type { StudentResult } from "@/types/student"

export class StudentService {
  static async getStudentById(id: string, school: string, grade: number): Promise<StudentResult> {
    const response = await fetch(`/api/results/${school}/${grade}/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Student not found")
    }

    return response.json()
  }
}
