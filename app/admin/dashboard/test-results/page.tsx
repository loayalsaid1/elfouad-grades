"use client"

import { useState, useRef, useEffect } from "react"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ResultsTable from "@/components/results/ResultsTable"
import GradeReference from "@/components/results/GradeReference"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Instructions from "@/components/Instructions"

export default function AdminTestResultsPage() {
  // Admin can select school and grade
  const [school, setSchool] = useState("international")
  const [grade, setGrade] = useState(1)

  const { pdfLoading, generatePDF } = usePDFGeneration()
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
  } = useStudentSearch(school, grade)

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
      (referenceRef.current || tableRef.current)?.scrollIntoView({ behavior: "smooth" });
  }, [student])

  // School/grade options
  const schools = [
    { id: "international", name: "El-Fouad International School" },
    { id: "modern", name: "El-Fouad Modern Schools" },
  ]
  const grades = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Student Results</h1>
        <p className="text-muted-foreground">
          Search and view student results as a normal user would.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose School and Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <select
                className="border rounded px-2 py-1"
                value={school}
                onChange={e => setSchool(e.target.value)}
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade</label>
              <select
                className="border rounded px-2 py-1"
                value={grade}
                onChange={e => setGrade(Number(e.target.value))}
              >
                {grades.map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {grade < 7 && (
              <div ref={referenceRef}>
                <GradeReference />
              </div>
            )}
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
  )
}
