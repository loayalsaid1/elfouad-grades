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
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import BackToDashboard from "@/components/admin/BackToDashboard"
import { useAdminUser } from "@/hooks/useAdminUser"
import LoadingPage from "@/components/admin/LoadingPage"
import ExportContextCSVButton from "@/components/admin/ExportContextCSVButton"

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
  } = useStudentSearch(
    selection.school,
    typeof selection.grade === "number" ? selection.grade : 0,
    typeof selection.year === "number" ? selection.year : undefined,
    typeof selection.term === "number" ? selection.term : undefined
  )

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

  // Fetch all schools (with id/slug mapping) on mount
  useEffect(() => {
    supabase
      .from("schools")
      .select("id, slug, name")
      .then(({ data }) => {
        if (data) setSchoolOptions(data)
      })
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
    supabase
      .from("academic_contexts")
      .select("id, year, term, grade, is_active")
      .eq("school_id", schoolObj.id)
      .eq("grade", selection.grade)
      .then(({ data }) => {
        if (!data) {
          setContextState(prev => ({ ...prev, loading: false }))
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.school, selection.grade, schoolOptions])

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

  const handleSelectionChange = (field: keyof typeof selection, value: any) => {
    setSelection(prev => ({ ...prev, [field]: value }))
  }

  if (!user) return <LoadingPage message="Loading test-results page..." />

  return (
    <div className="container mx-auto px-4 py-8">
      <BackToDashboard />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Student Results</h1>
        <p className="text-muted-foreground">
          Search and view student results as a normal user would.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Academic Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <select
                className="border rounded px-2 py-1"
                value={selection.school}
                onChange={e => handleSelectionChange("school", e.target.value)}
              >
                <option value="">Select School</option>
                {schoolOptions.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade</label>
              <select
                className="border rounded px-2 py-1"
                value={selection.grade}
                onChange={e => handleSelectionChange("grade", Number(e.target.value) || "")}
                disabled={!selection.school}
              >
                <option value="">Select Grade</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                className="border rounded px-2 py-1"
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
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select
                className="border rounded px-2 py-1"
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

          {/* Export buttons for all available contexts */}
          {contextState.contexts.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-2 text-sm">Export CSV for any context:</div>
              <div className="flex flex-wrap gap-2">
                {contextState.contexts.map((ctx) => {
                  // Find school name for this context
                  const schoolObj = schoolOptions.find((s) => s.id === ctx.school_id)
                  return (
                    <ExportContextCSVButton
                      key={ctx.id}
                      context={{
                        id: ctx.id,
                        year: ctx.year,
                        term: ctx.term,
                        grade: ctx.grade,
                        school_id: ctx.school_id,
                        school_name: schoolObj?.name,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <StudentSearchForm onSearch={canSearch ? handleSearch : undefined} loading={loading || contextState.loading} />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
