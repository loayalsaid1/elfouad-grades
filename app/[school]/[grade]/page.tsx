"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import StudentInfo from "@/components/results/StudentInfo"
import ResultsTable from "@/components/results/ResultsTable"
import GradeReference from "@/components/results/GradeReference"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import { useActiveContext } from "@/hooks/useActiveContext"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Database } from "lucide-react"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Instructions from "@/components/Instructions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"


export default function GradePage() {
  const router = useRouter()
  const params = useParams()
  const school = params.school as string
  const grade = params.grade as string

const { pdfLoading, generatePDF } = usePDFGeneration()

  const { year, term, loading: contextLoading, error: contextError } = useActiveContext(school, grade)
  const {
      studentResult: student,
    loading,
    error,
    searchStudent,
    showPasswordDialog,
    submitPassword,
    cancelPasswordDialog,
    passwordError,
    passwordLoading,
} = useStudentSearch(school, Number.parseInt(grade))

  // Add refs for GradeReference and ResultsTable
  const referenceRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)

  const handleSearch = async (studentId: string, password?: string) => {
    await searchStudent(studentId, password)
  }

  const handlePasswordSubmit = async (password: string) => {
    await submitPassword(password)
  }

  // Scroll into view when student is found
  useEffect(() => {
    if (student)
      // Scroll reference (if exists) and table into view
      (referenceRef.current || tableRef.current)?.scrollIntoView({ behavior: "smooth" });
  }, [student])

  const handleBack = () => {
    router.push(`/${school}`)
  }
  
  // Show context loading state
  if (contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Database className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg">Loading academic context...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show context error
  if (contextError) {
    return (
      <div className="container h-full mx-auto px-4 py-8">
        <Button variant="outline" onClick={handleBack} className="mb-8 hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grades
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Academic Context Error:</strong> {contextError}
            <br />
            <span className="text-sm mt-2 block">
              Please ensure that an active academic context is set up for {school} grade {grade} in the admin dashboard.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={handleBack} className="mb-8 hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grades
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {school === "international" ? "El-Fouad International School" : "El-Fouad Modern Schools"} - Grade {grade}
          </h1>
          <p className="text-muted-foreground">
            Academic Year {year}/{year + 1} - Term {term}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <StudentSearchForm onSearch={handleSearch} loading={loading} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {student && (
            <>
              {/* GradeReference (with ref) */}
              {Number.parseInt(grade) < 7 && (
                <div ref={referenceRef}>
                  <GradeReference />
                </div>
              )}
              {/* ResultsTable (with ref) */}
              <div ref={tableRef}>
                <ResultsTable student={student} onExportPDF={() => generatePDF(student)} pdfLoading={pdfLoading} />
              </div>
            </>
          )}

          {!student && <Instructions />}
        </div>

        <ParentPasswordDialog
          open={showPasswordDialog}
          onCancel={cancelPasswordDialog}
          onSubmit={handlePasswordSubmit}
          loading={passwordLoading}
          error={passwordError}
          studentName={student?.name}
        />
      </div>
    </div>
  )
}
