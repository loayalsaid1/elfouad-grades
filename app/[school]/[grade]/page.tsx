"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ResultsTable from "@/components/results/ResultsTable"
import GradeReference from "@/components/results/GradeReference"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import { useActiveContext } from "@/hooks/useActiveContext"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Database, GraduationCap } from "lucide-react"
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

  const handleSearch = useCallback(async (studentId: string, password?: string) => {
    await searchStudent(studentId, password)
  }, [searchStudent])

  const handlePasswordSubmit = useCallback(async (password: string) => {
    await submitPassword(password)
  }, [submitPassword])

  // Scroll into view when student is found
  useEffect(() => {
    if (student) {
      // Scroll reference (if exists) and table into view
      (referenceRef.current || tableRef.current)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [student])

  const handleBack = useCallback(() => {
    router.push(`/${school}`)
  }, [router, school])
  
  // Show context loading state
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="shadow-xl border-2 p-8">
              <div className="text-center">
                <div className="bg-[#223152] p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <Database className="h-8 w-8 animate-spin text-white" />
                </div>
                <p className="text-lg font-medium text-[#223152]">Loading academic context...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your results</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show context error
  if (contextError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="mb-8 hover:bg-[#223152] hover:text-white hover:border-[#223152] transition-all duration-300 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grades
          </Button>
          
          <Alert variant="destructive" className="shadow-xl animate-in slide-in-from-top-2 duration-300">
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
      </div>
    )
  }

  const schoolName = school === "international" ? "El-Fouad International School" : "El-Fouad Modern Schools"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-8 hover:bg-[#223152] hover:text-white hover:border-[#223152] transition-all duration-300 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grades
        </Button>
        
        {/* Header Section */}
        <Card className="mb-8 shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
            <CardTitle className="text-white flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{schoolName} - Grade {grade}</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Academic Year {year}/{year + 1} - Term {term}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-6">
          <StudentSearchForm onSearch={handleSearch} loading={loading} />

          {error && (
            <Alert variant="destructive" className="shadow-lg animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {student && (
            <>
              {/* GradeReference (with ref) */}
              {Number.parseInt(grade) < 7 && (
                <div ref={referenceRef} className="animate-in slide-in-from-bottom-4 duration-500">
                  <GradeReference />
                </div>
              )}
              {/* ResultsTable (with ref) */}
              <div ref={tableRef} className="animate-in slide-in-from-bottom-4 duration-700">
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
