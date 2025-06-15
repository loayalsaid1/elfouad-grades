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
import { AlertCircle, Database } from "lucide-react"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Instructions from "@/components/Instructions"


export default function GradePage() {
  const params = useParams()
  const school = params.school as string
  const grade = params.grade as string

const { pdfLoading, generatePDF } = usePDFGeneration()

  // const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingStudentId, setPendingStudentId] = useState<string>("")

  const { year, term, loading: contextLoading, error: contextError } = useActiveContext(school, grade)
  // const { studentResult: student, loading, error, searchStudent, clearStudent } = useStudentSearch(school, Number.parseInt(grade))
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
    try {
      await searchStudent(studentId, password)
      setShowPasswordDialog(false)
      setPendingStudentId("")
    } catch (err: any) {
      if (err.requiresPassword && !password) {
        setPendingStudentId(studentId)
        setShowPasswordDialog(true)
      }
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    if (pendingStudentId) {
      await handleSearch(pendingStudentId, password)
    }
  }

  // Scroll into view when student is found
  useEffect(() => {
    if (student)
      // Scroll reference (if exists) and table into view
      (referenceRef.current || tableRef.current)?.scrollIntoView({ behavior: "smooth" });
  }, [student])

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
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
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
        onSubmit={submitPassword}
        loading={passwordLoading}
        error={passwordError}
        studentName={pendingStudentId ? student?.name : ''}
      />
    </div>
  )
}
