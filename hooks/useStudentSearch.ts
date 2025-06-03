"use client"

import { useState } from "react"
import { StudentService } from "@/services/studentService"
import type { StudentResult } from "@/types/student"

export function useStudentSearch(school?: string, grade?: number) {
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchStudent = async (studentId: string) => {
    if (!school || !grade) {
      setError("School and grade must be specified")
      return
    }

    setLoading(true)
    setError("")
    setStudentResult(null)

    try {
      const result = await StudentService.getStudentById(studentId, school, grade)
      setStudentResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student data")
    } finally {
      setLoading(false)
    }
  }

  return {
    studentResult,
    loading,
    error,
    searchStudent,
  }
}
