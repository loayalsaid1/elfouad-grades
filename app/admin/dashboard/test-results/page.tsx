"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import StudentSearchForm from "@/components/search/StudentSearchForm"
import ResultsTable from "@/components/results/ResultsTable"
import GradeReference from "@/components/results/GradeReference"
import ParentPasswordDialog from "@/components/search/ParentPasswordDialog"
import { useStudentSearch } from "@/hooks/useStudentSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, TestTube } from "lucide-react"
import { usePDFGeneration } from "@/hooks/usePDFGeneration"
import Instructions from "@/components/Instructions"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import BackToDashboard from "@/components/admin/BackToDashboard"
import { useAdminUser } from "@/hooks/useAdminUser"
import LoadingPage from "@/components/admin/LoadingPage"
import ExportContextCSVButton from "@/components/admin/ExportContextCSVButton"
import { useStudentEdit } from "@/hooks/useStudentEdit"
import { EditStudentDialog } from "@/components/results/EditStudentDialog"
import { useStudentDelete } from "@/hooks/useStudentDelete"
import { DeleteStudentDialog } from "@/components/results/DeleteStudentDialog"
import type { StudentResult } from "@/types/student"


export default function AdminTestResultsPage() {
  const user = useAdminUser()
  // Use school slug for querying, so fetch all schools with id/slug mapping
  const [schoolOptions, setSchoolOptions] = useState<{ id: number; slug: string; name: string }[]>([])
  const [selection, setSelection] = useState({
    school: "",
    grade: "" as number | "",
    year: "" as number | "",
    term: "" as number | "",
  })

  const [contextState, setContextState] = useState({
    years: [] as number[],
    terms: [] as number[],
    contexts: [] as any[],
    activeContext: null as any | null,
    loading: false,
  })

  const supabase = createClientComponentSupabaseClient()

  // Student search hook (only call if all dropdowns selected)
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
    clearResult,
  } = useStudentSearch(
    selection.school,
    typeof selection.grade === "number" ? selection.grade : 0,
    typeof selection.year === "number" ? selection.year : undefined,
    typeof selection.term === "number" ? selection.term : undefined
  )

  // Edit student hook
  const {
    editing,
    startEdit,
    cancelEdit,
    saveEdit,
    pending: editPending,
    error: editError,
    success: editSuccess,
  } = useStudentEdit()

  // Delete student hook
  const {
    deleteStudent,
    pending: deletePending,
    error: deleteError,
    success: deleteSuccess,
    clearMessages: clearDeleteMessages,
  } = useStudentDelete()

  // State for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<StudentResult | null>(null)

  // Add refs for GradeReference and ResultsTable
  const referenceRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)

  // Memoize grade options to prevent re-rendering
  const gradeOptions = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => i + 1),
    []
  )

  const handleSearch = useCallback(async (studentId: string) => {
    await searchStudent(studentId)
  }, [searchStudent])

  const handlePasswordSubmit = useCallback(async (password: string) => {
    await submitPassword(password)
  }, [submitPassword])

  // Delete handlers
  const handleDeleteClick = useCallback((student: StudentResult) => {
    setStudentToDelete(student)
    setShowDeleteDialog(true)
    clearDeleteMessages()
  }, [clearDeleteMessages])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false)
    setStudentToDelete(null)
    clearDeleteMessages()
  }, [clearDeleteMessages])

  const handleDeleteConfirm = useCallback(async () => {
    if (!studentToDelete || !contextState.activeContext) return
    
    const success = await deleteStudent(studentToDelete, { id: contextState.activeContext.id })
    if (success) {
      setShowDeleteDialog(false)
      setStudentToDelete(null)
      // Clear the current student result since it was deleted
      clearResult()
    }
  }, [studentToDelete, contextState.activeContext, deleteStudent, clearResult])

  // Scroll into view when student is found
  useEffect(() => {
    if (student)
      (referenceRef.current || tableRef.current)?.scrollIntoView({ behavior: "smooth" });
  }, [student])

  // Fetch all schools (with id/slug mapping) on mount
  useEffect(() => {
    let mounted = true
    
    supabase
      .from("schools")
      .select("id, slug, name")
      .then(({ data }) => {
        if (data && mounted) setSchoolOptions(data)
      })
      
    return () => {
      mounted = false
    }
  }, [supabase])

  // Fetch available contexts when school/grade changes
  useEffect(() => {
    setContextState(prev => ({ ...prev, years: [], terms: [], activeContext: null, contexts: [] }))
    if (!selection.school || !selection.grade) return

    setContextState(prev => ({ ...prev, loading: true }))
    // Find school id from slug
    const schoolObj = schoolOptions.find((s) => s.slug === selection.school)
    if (!schoolObj) {
      setContextState(prev => ({ ...prev, loading: false }))
      return
    }
    
    let mounted = true
    
    supabase
      .from("academic_contexts")
      .select("id, year, term, grade, is_active, school_id")
      .eq("school_id", schoolObj.id)
      .eq("grade", selection.grade)
      .then(({ data }) => {
        if (!data || !mounted) {
          if (mounted) setContextState(prev => ({ ...prev, loading: false }))
          return
        }
        console.log("Fetched contexts:", data, schoolObj.id, selection.grade)
        setContextState(prev => ({ ...prev, contexts: data }))
        // Extract unique years and terms
        const uniqueYears = Array.from(new Set(data.map((c) => c.year))).sort((a, b) => b - a)
        setContextState(prev => ({ ...prev, years: uniqueYears }))
        // If only one year, auto-select it
        if (uniqueYears.length === 1) setSelection(prev => ({ ...prev, year: uniqueYears[0] }))
        setContextState(prev => ({ ...prev, loading: false }))
      })
      
    return () => {
      mounted = false
    }
  }, [selection.school, selection.grade, schoolOptions, supabase])

  // When year changes, update terms
  useEffect(() => {
    setContextState(prev => ({ ...prev, terms: [], activeContext: null }))
    if (!selection.year || !contextState.contexts.length) return
    const filtered = contextState.contexts.filter((c) => c.year === selection.year)
    const uniqueTerms = Array.from(new Set(filtered.map((c) => c.term))).sort()
    setContextState(prev => ({ ...prev, terms: uniqueTerms }))
    // If only one term, auto-select it
    if (uniqueTerms.length === 1) setSelection(prev => ({ ...prev, term: uniqueTerms[0] }))
  }, [selection.year, contextState.contexts])

  // When term changes, set active context if available
  useEffect(() => {
    if (!selection.year || !selection.term || !contextState.contexts.length) {
      setContextState(prev => ({ ...prev, activeContext: null }))
      return
    }
    const filtered = contextState.contexts.filter((c) => c.year === selection.year && c.term === selection.term)
    // Prefer active context, else first
    const active = filtered.find((c) => c.is_active) || filtered[0] || null
    setContextState(prev => ({ ...prev, activeContext: active }))
  }, [selection.year, selection.term, contextState.contexts])

  // Only allow search if all dropdowns are selected and context exists
  const canSearch = !!(selection.school && selection.grade && selection.year && selection.term && contextState.activeContext)

  const handleSelectionChange = useCallback((field: keyof typeof selection, value: any) => {
    setSelection(prev => ({ ...prev, [field]: value }))
  }, [])

  if (!user) return <LoadingPage message="Loading test-results page..." />

  return (
      <div className="container mx-auto px-4">
        <BackToDashboard />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 sm:p-3 rounded-full mr-2 sm:mr-4 flex-shrink-0">
              <TestTube className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            Test Student Results
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Search and view student results as a normal user would.
          </p>
        </div>

        <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
            <CardTitle className="text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <TestTube className="h-5 w-5" />
              </div>
              Choose Academic Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-[#223152] mb-2">School</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
                  value={selection.school}
                  onChange={e => handleSelectionChange("school", e.target.value)}
                >
                  <option value="">Select School</option>
                  {schoolOptions.map(s => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-[#223152] mb-2">Grade</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
                  value={selection.grade}
                  onChange={e => handleSelectionChange("grade", Number(e.target.value) || "")}
                  disabled={!selection.school}
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-[#223152] mb-2">Year</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
                  value={selection.year}
                  onChange={e => handleSelectionChange("year", Number(e.target.value) || "")}
                  disabled={!selection.grade || !contextState.years.length}
                >
                  <option value="">Select Year</option>
                  {contextState.years.map(y => (
                    <option key={y} value={y}>{y}-{y + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-[#223152] mb-2">Term</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
                  value={selection.term}
                  onChange={e => handleSelectionChange("term", Number(e.target.value) || "")}
                  disabled={!selection.year || !contextState.terms.length}
                >
                  <option value="">Select Term</option>
                  {contextState.terms.map(t => (
                    <option key={t} value={t}>{t === 1 ? "First Term" : "Second Term"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export button for the selected context */}
            {contextState.activeContext && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="font-semibold mb-3 text-sm text-[#223152]">Export CSV for selected context:</div>
                <ExportContextCSVButton
                  context={{
                    id: contextState.activeContext.id,
                    year: contextState.activeContext.year,
                    term: contextState.activeContext.term,
                    grade: contextState.activeContext.grade,
                    school_id: contextState.activeContext.school_id,
                    school_slug: schoolOptions.find((s) => s.id === contextState.activeContext.school_id)?.slug,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <StudentSearchForm onSearch={canSearch ? handleSearch : () => Promise.resolve()} loading={loading || contextState.loading} />

          {error && (
            <Alert variant="destructive" className="shadow-lg animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {deleteError && (
            <Alert variant="destructive" className="shadow-lg animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          {deleteSuccess && (
            <Alert className="shadow-lg animate-in slide-in-from-top-2 duration-300 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{deleteSuccess}</AlertDescription>
            </Alert>
          )}

          {student && (
            <>
              {typeof selection.grade === "number" && selection.grade < 7 && (
                <div ref={referenceRef}>
                  <GradeReference />
                </div>
              )}
              <div ref={tableRef}>
                <ResultsTable
                  student={student}
                  onExportPDF={() => generatePDF(student)}
                  pdfLoading={pdfLoading}
                  onEdit={() => startEdit(student)} // Pass onEdit for admin
                  onDelete={() => handleDeleteClick(student)} // Pass onDelete for admin
                />
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

        {/* Edit Student Dialog */}
        <EditStudentDialog
          open={!!editing}
          student={editing}
          onCancel={cancelEdit}
          onSave={async (updated) => {
            if (!contextState.activeContext) return false
            const ok = await saveEdit(updated, { id: contextState.activeContext.id })
            // Optionally, you could refresh the student result here
            if (ok && canSearch && student) {
              await searchStudent(student.id)
            }
            return ok
          }}
          pending={editPending}
          error={editError}
        />

        {/* Delete Student Dialog */}
        <DeleteStudentDialog
          open={showDeleteDialog}
          student={studentToDelete}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          pending={deletePending}
        />
      </div>
  )
}
