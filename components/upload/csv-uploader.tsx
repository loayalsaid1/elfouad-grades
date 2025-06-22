"use client"

import { useState, useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Settings } from "lucide-react"
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

  // Memoize dropzone configuration
  const dropzoneConfig = useMemo(
    () => ({
      accept: {
        "text/csv": [".csv"],
        "application/vnd.ms-excel": [".csv"],
      },
      maxFiles: 1,
    }),
    [],
  )

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
    ...dropzoneConfig,
  })

  // Optimized CSV parsing with better error handling
  const parseCSV = useCallback(
    (file: File) => {
      setLoading(true)
      setError(null)

      const parseConfig = {
        header: true,
        skipEmptyLines: true,
        worker: false, // Disable worker for better performance in this case
        chunk: undefined, // Process all at once for smaller files
        complete: (results: Papa.ParseResult<Record<string, string>>) => {
          try {
            if (results.errors.length > 0) {
              setError(`CSV parsing error: ${results.errors[0].message}`)
              return
            }

            const rows = results.data
            if (rows.length < 2) {
              setError("CSV must contain at least 2 rows (header row, full marks row, and student data)")
              return
            }

            // Extract subject names (all columns except id, student_name, parent_password)
            const subjectNames = Object.keys(rows[0]).filter(
              (key) => !["id", "student_id", "student_name", "parent_password"].includes(key),
            )

            if (subjectNames.length === 0) {
              setError("No subject columns found in CSV")
              return
            }

            setSubjects(subjectNames)

            // Extract full marks from the first row
            const fullMarksRow = rows[0]
            const fullMarksObj: Record<string, number> = {}

            for (const subject of subjectNames) {
              const mark = Number.parseFloat(fullMarksRow[subject])
              if (isNaN(mark)) {
                throw new Error(`Invalid full mark for subject ${subject}`)
              }
              fullMarksObj[subject] = mark
            }

            setFullMarks(fullMarksObj)

            // Parse student data (starting from the second row)
            const studentData: ParsedStudent[] = rows.slice(1).map((row) => {
              const scores: { subject: string; score: number; full_mark: number; absent: boolean }[] = []

              for (const subject of subjectNames) {
                const value = row[subject]?.trim().toLowerCase()
                if (value === "n/a") {
                  // Skip this subject for this student
                  continue
                }
                const score = Number.parseFloat(row[subject])
                scores.push({
                  subject,
                  score: isNaN(score) ? 0 : score,
                  full_mark: fullMarksObj[subject],
                  absent: false, // CSV uploader does not handle absence, set to false
                })
              }

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
        error: (error: Error) => {
          setError(`Failed to parse CSV: ${error.message}`)
          setLoading(false)
        },
      }

      Papa.parse(file, parseConfig)
    },
    [],
  )

  // Debounced context change handler
  const handleContextChange = useCallback((context: CSVUploadContext) => {
    setUploadContext(context)
  }, [])

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
    <div className="space-y-8">
      {/* File Upload Area */}
      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-[#223152] bg-blue-50 scale-[1.02]"
                : "border-gray-300 hover:border-[#223152] hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                className={`p-4 rounded-full transition-all duration-300 ${
                  isDragActive ? "bg-[#223152] scale-110" : "bg-gray-100 hover:bg-[#223152] hover:scale-110"
                }`}
              >
                <Upload
                  className={`h-8 w-8 transition-colors duration-300 ${
                    isDragActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-[#223152]">
                  {isDragActive ? "Drop the CSV file here" : "Drag & drop a CSV file here"}
                </p>
                <p className="text-sm text-gray-500">or click to browse files (CSV format only)</p>
              </div>
            </div>
          </div>

          {file && (
            <div className="mt-6 flex items-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-300">
              <FileText className="h-6 w-6 text-[#223152] mr-3" />
              <div className="flex-1">
                <span className="text-sm font-medium text-[#223152]">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#223152] mr-3" />
              <span className="text-lg text-[#223152] font-medium">Parsing CSV data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Student results successfully uploaded!
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview and Context Selection */}
      {parsedData && parsedData.length > 0 && (
        <>
          <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-[#223152] mb-6 flex items-center">
                <div className="bg-[#223152] p-2 rounded-full mr-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Select Academic Context
              </h3>
              <UploadContextSelector onChange={handleContextChange} />
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-[#223152] mb-6 flex items-center">
                <div className="bg-[#223152] p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Preview Results
              </h3>
              <ResultsPreviewTable students={parsedData} subjects={subjects} fullMarks={fullMarks} />

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSaveResults}
                  disabled={!uploadContext || uploading}
                  className="min-w-[180px] bg-[#223152] hover:bg-[#1a2642] text-white font-medium py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving Results...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Save Results
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* CSV Format Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#223152] mb-4 flex items-center">
            <div className="bg-blue-500 p-2 rounded-full mr-3">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            CSV Format Instructions
          </h3>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <ul className="list-disc list-inside text-sm text-[#223152] space-y-2">
              <li>
                <strong>First row:</strong> Column headers (id, student_name, parent_password, followed by subject names)
              </li>
              <li>
                <strong>Second row:</strong> Full marks for each subject
              </li>
              <li>
                <strong>Remaining rows:</strong> Student data with scores for each subject
              </li>
              <li>
                <strong>Optional:</strong> The parent_password column can be left empty
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
