"use client"

import { useState } from "react"
import { StudentService } from "@/services/studentService"
import type { StudentResult, PasswordRequiredError } from "@/types/student"

export function useStudentSearch(
  school: string,
  grade: number,
  year?: number,
  term?: number
) {
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const searchStudent = async (studentId: string) => {
    setLoading(true)
    setError("")
    setStudentResult(null)

    try {
      const result = await StudentService.getStudentById(studentId, school, grade, undefined, year, term)
      setStudentResult(result)
    } catch (err) {
      const error = err as Error & PasswordRequiredError

      if (error.requiresPassword) {
        setPendingStudentId(studentId)
        setShowPasswordDialog(true)
        setPasswordError("")
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const submitPassword = async (password: string) => {
    if (!pendingStudentId) return

    setPasswordLoading(true)
    setPasswordError("")

    try {
      const result = await StudentService.getStudentById(pendingStudentId, school, grade, password, year, term)
      setStudentResult(result)
      setShowPasswordDialog(false)
      setPendingStudentId(null)
    } catch (err) {
      const error = err as Error & PasswordRequiredError
      if (error.requiresPassword) {
        setPasswordError(error.message)
      } else {
        setShowPasswordDialog(false)
        setPendingStudentId(null)
        setError(error.message)
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const cancelPasswordDialog = () => {
    setShowPasswordDialog(false)
    setPendingStudentId(null)
    setPasswordError("")
  }

  const clearResult = () => {
    setStudentResult(null)
    setError("")
  }

  return {
    studentResult,
    loading,
    error,
    searchStudent,
    showPasswordDialog,
    submitPassword,
    cancelPasswordDialog,
    passwordError,
    passwordLoading,
    clearResult,
  }
}
