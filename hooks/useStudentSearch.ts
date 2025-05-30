"use client"

import { useState } from "react"
import { StudentService } from "@/services/studentService"
import type { StudentResult } from "@/types/student"

export function useStudentSearch() {
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchStudent = async (studentId: string) => {
    if (!studentId.trim()) {
      setError("Please enter a student ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await StudentService.getStudentById(studentId)
      setStudentResult(data)
    } catch (err) {
      setError("Student not found. Please check the ID and try again.")
      setStudentResult(null)
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
