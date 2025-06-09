"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ResultsTable from "@/components/results/ResultsTable"
import StudentInfo from "@/components/results/StudentInfo"
import GradeReference from "@/components/results/GradeReference"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useActiveContext } from "@/hooks/useActiveContext"
import type { Student } from "@/types/student"

export default function GradePage() {
  const params = useParams()
  const router = useRouter()
  const school = params.school as string
  const grade = params.grade as string

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the active context hook instead of importing currentRound
  const { year, term, loading: contextLoading, error: contextError } = useActiveContext(school, grade)

  const fetchResults = async (studentId: string) => {
    if (!year || !term) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/results/${school}/${grade}/${studentId}?year=${year}&term=${term}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Student not found. Please check the ID and try again.")
        } else if (response.status === 403) {
          setError("Access denied. Please check your credentials.")
        } else {
          setError("An error occurred while fetching results.")
        }
        setStudent(null)
        setLoading(false)
        return
      }

      const data = await response.json()
      setStudent(data)
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // If context is loading, show loading state
  if (contextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If there's a context error, show error message
  if (contextError) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertDescription>Error loading academic period: {contextError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {school === "international" ? "El Fouad International School" : "El Fouad Modern School"} - Grade {grade}
      </h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <StudentSearchForm onSearch={fetchResults} />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {student && (
        <div className="space-y-8">
          <StudentInfo student={student} school={school} grade={grade} year={year} term={term} />
          <ResultsTable student={student} />
          <GradeReference />
        </div>
      )}
    </div>
  )
}
