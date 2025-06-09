"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import type { CSVUploadContext, ParsedStudent } from "@/types/supabase"
import { UploadContextSelector } from "./upload-context-selector"
import { ResultsPreviewTable } from "./results-preview-table"

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedStudent[] | null>(null)
  const [fullMarks, setFullMarks] = useState<Record<string, number>>({})
  const [subjects, setSubjects] = useState<string[]>([])
  const [uploadContext, setUploadContext] = useState<CSVUploadContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientComponentSupabaseClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setError(null)
      setSuccess(false)
      setParsedData(null)
      setFullMarks({})
      setSubjects([])
      parseCSV(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
  })

  const parseCSV = (file: File) => {
    setLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`)
            setLoading(false)
            return
          }

          const rows = results.data as Record<string, string>[]
          if (rows.length < 2) {
            setError("CSV must contain at least 2 rows (header row, full marks row, and student data)")
            setLoading(false)
            return
          }

          // Extract subject names (all columns except id, student_name, parent_password)
          const subjectNames = Object.keys(rows[0]).filter(
            (key) => !["id", "student_id", "student_name", "parent_password"].includes(key),
          )

          if (subjectNames.length === 0) {
            setError("No subject columns found in CSV")
            setLoading(false)
            return
          }

          setSubjects(subjectNames)

          // Extract full marks from the first row
          const fullMarksRow = rows[0]
          const fullMarksObj: Record<string, number> = {}

          subjectNames.forEach((subject) => {
            const mark = Number.parseFloat(fullMarksRow[subject])
            if (isNaN(mark)) {
              throw new Error(`Invalid full mark for subject ${subject}`)
            }
            fullMarksObj[subject] = mark
          })

          setFullMarks(fullMarksObj)

          // Parse student data (starting from the second row)
          const studentData: ParsedStudent[] = rows.slice(1).map((row) => {
            const scores: Record<string, { score: number; full_mark: number }> = {}

            subjectNames.forEach((subject) => {
              const score = Number.parseFloat(row[subject])
              scores[subject] = {
                score: isNaN(score) ? 0 : score,
                full_mark: fullMarksObj[subject],
              }
            })

            return {
              student_id: row.id || row.student_id,
              student_name: row.student_name,
              parent_password: row.parent_password || null,
              scores,
            }
          })

          setParsedData(studentData)
        } catch (err: any) {
          setError(`Error processing CSV: ${err.message}`)
        } finally {
          setLoading(false)
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`)
        setLoading(false)
      },
    })
  }

  const handleContextChange = (context: CSVUploadContext) => {
    setUploadContext(context)
  }

  const handleSaveResults = async () => {
    if (!parsedData || !uploadContext) return

    setUploading(true)
    setError(null)

    try {
      // First, check if the academic context exists or create it
      let contextId = uploadContext.school_id

      // Check if we already have this context
      const { data: existingContext, error: contextQueryError } = await supabase
        .from("academic_contexts")
        .select("id")
        .eq("school_id", uploadContext.school_id)
        .eq("year", uploadContext.year)
        .eq("term", uploadContext.term)
        .eq("grade", uploadContext.grade)
        .single()

      if (contextQueryError && contextQueryError.code !== "PGRST116") {
        throw new Error(`Error checking academic context: ${contextQueryError.message}`)
      }

      if (existingContext) {
        contextId = existingContext.id
      } else {
        // Create new academic context
        const { data: newContext, error: createContextError } = await supabase
          .from("academic_contexts")
          .insert({
            school_id: uploadContext.school_id,
            year: uploadContext.year,
            term: uploadContext.term,
            grade: uploadContext.grade,
          })
          .select("id")
          .single()

        if (createContextError) {
          throw new Error(`Error creating academic context: ${createContextError.message}`)
        }

        contextId = newContext.id
      }

      // Now insert student results
      const studentInserts = parsedData.map((student) => ({
        student_id: student.student_id,
        student_name: student.student_name,
        parent_password: student.parent_password,
        context_id: contextId,
        scores: student.scores,
      }))

      const { error: insertError } = await supabase.from("student_results").insert(studentInserts)

      if (insertError) {
        throw new Error(`Error saving student results: ${insertError.message}`)
      }

      setSuccess(true)
      // Reset form
      setFile(null)
      setParsedData(null)
      setFullMarks({})
      setSubjects([])
      setUploadContext(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop the CSV file here" : "Drag & drop a CSV file here"}
                </p>
                <p className="text-xs text-gray-500">or click to browse files (CSV format only)</p>
              </div>
            </div>
          </div>

          {file && (
            <div className="mt-4 flex items-center p-2 bg-gray-50 rounded-md">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Parsing CSV data...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Student results successfully uploaded!</AlertDescription>
        </Alert>
      )}

      {/* Data Preview and Context Selection */}
      {parsedData && parsedData.length > 0 && (
        <>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Select Academic Context</h3>
            <UploadContextSelector onChange={handleContextChange} />
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Preview Results</h3>
            <ResultsPreviewTable students={parsedData} subjects={subjects} fullMarks={fullMarks} />

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveResults} disabled={!uploadContext || uploading} className="min-w-[150px]">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Results"
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* CSV Format Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-2">CSV Format Instructions</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>First row: Column headers (id, student_name, parent_password, followed by subject names)</li>
          <li>Second row: Full marks for each subject</li>
          <li>Remaining rows: Student data with scores for each subject</li>
          <li>The parent_password column is optional</li>
        </ul>
      </div>
    </div>
  )
}
