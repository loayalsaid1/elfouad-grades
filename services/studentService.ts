import type { StudentResult } from "@/types/student"

export class StudentService {
  static async getStudentById(id: string): Promise<StudentResult> {
    const response = await fetch(`/api/students/${id}`)

    if (!response.ok) {
      throw new Error("Student not found")
    }

    return response.json()
  }
}
