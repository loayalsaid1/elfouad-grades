"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ResultsTable from "@/components/results/ResultsTable"
import GradeReference from "@/components/results/GradeReference"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import { useActiveContext } from "@/hooks/useActiveContext"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Instructions from "@/components/Instructions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSchool } from "@/hooks/useSchool"
import { GradePageLoadingSkeleton } from "@/components/ui/GradePageLoadingSkeleton"
import { SchoolNotFound } from "@/components/errors/SchoolNotFound"
import { ContextError } from "@/components/errors/ContextError"
import { ContextLoading } from "@/components/ui/ContextLoading"


export default function GradePage() {
  const router = useRouter()
  const params = useParams()
  const schoolSlug = params?.school as string
  const grade = params?.grade as string

  const { school, loading: schoolLoading, retry: retrySchool } = useSchool(schoolSlug)

const { pdfLoading, generatePDF } = usePDFGeneration()

  const { year, term, loading: contextLoading, error: contextError } = useActiveContext(schoolSlug, grade)
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
} = useStudentSearch(schoolSlug, Number.parseInt(grade))

  // Add refs for GradeReference and ResultsTable
  const referenceRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)

  const handleSearch = async (studentId: string, password?: string) => {
    await searchStudent(studentId)
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
    router.push(`/${schoolSlug}`)
  }
  
  // Show context loading state
  if (contextLoading) {
    return <ContextLoading />
  }
  
  // Show school loading state
  if (schoolLoading) {
    return <GradePageLoadingSkeleton />
  }

  // Show school not found error
  if (!school && !schoolLoading) {
    return (
      <SchoolNotFound 
        schoolSlug={schoolSlug}
        grade={grade}
        onBack={() => router.push("/")}
        onRetry={retrySchool}
      />
    )
  }

  // Show context error
  if (contextError) {
    return (
      <ContextError 
        error={contextError}
        schoolSlug={schoolSlug}
        grade={grade}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={handleBack} className="mb-8 hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grades
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {school?.name || schoolSlug} - Grade {grade}
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

          {/* GradeReference (with ref) */}
          {Number.parseInt(grade) < 7 && (
            <div ref={referenceRef}>
              <GradeReference />
            </div>
          )}
          {student && (
            <>
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
