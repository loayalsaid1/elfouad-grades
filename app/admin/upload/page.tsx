"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertCircle, CheckCircle, Info } from "lucide-react"
import { ContextSelector } from "@/components/admin/context-selector"
import Papa from "papaparse"

interface ParsedStudent {
  student_id: string
  student_name: string
  parent_password: string | null
  scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[]
}

interface UploadContext {
  school_id: number
  year: number
  term: number
  grade: number
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<string[][] | null>(null)
  const [processedStudents, setProcessedStudents] = useState<ParsedStudent[]>([])
  const [context, setContext] = useState<UploadContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const supabase = createClientComponentClient()

  // Helper function to check if a value indicates absence (ONLY for subject scores)
  const isAbsentScore = (value: string): boolean => {
    if (!value) return true
    const trimmed = value.trim().toLowerCase()
    return trimmed === "" || trimmed === "-" || trimmed === "absent" || trimmed === "غائب"
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      parseCSV(file)
    }
  }, [])

  const parseCSV = (file: File) => {
    setMessage({ type: "info", text: "Parsing CSV file..." })

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][]

        // Filter out empty rows
        const filteredData = data.filter((row) => row.some((cell) => cell && cell.trim() !== ""))

        if (filteredData.length < 3) {
          setMessage({ type: "error", text: "CSV must have at least 3 rows: headers, full marks, and student data." })
          return
        }

        setParsedData(filteredData)
        processCSVData(filteredData)
      },
      header: false,
      skipEmptyLines: true,
    })
  }

  const processCSVData = (data: string[][]) => {
    const errors: string[] = []

    try {
      const headers = data[0].map((h) => h.trim())
      const fullMarks = data[1]
      const studentRows = data.slice(2)

      // Strict header check: first three columns must be "id", "student_name", "parent_password"
      if (
        headers.length < 4 ||
        headers[0].toLowerCase() !== "id" ||
        headers[1].toLowerCase() !== "student_name" ||
        headers[2].toLowerCase() !== "parent_password"
      ) {
        errors.push(
          `First row must start with columns: "id", "student_name", "parent_password" (in this order), followed by subject columns.`
        )
        setValidationErrors(errors)
        setMessage({ type: "error", text: "CSV validation failed. Please check the errors below." })
        return
      }

      // Find column indices (now fixed)
      const studentIdIndex = 0
      const studentNameIndex = 1
      const parentPasswordIndex = 2

      // Subject columns: everything after the first three
      const subjectIndices = headers
        .map((header, index) => ({ header: header.trim(), index }))
        .filter(({ index }) => index > 2)

      if (subjectIndices.length === 0) {
        errors.push("No subject columns found (must be after the first three columns).")
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
        setMessage({ type: "error", text: "CSV validation failed. Please check the errors below." })
        return
      }

      // Process students
      const students: ParsedStudent[] = []
      let absentCount = 0

      studentRows.forEach((row, rowIndex) => {
        const studentId = row[studentIdIndex]?.trim()
        const studentName = row[studentNameIndex]?.trim()

        // parent_password: empty means null
        let parentPassword: string | null = null
        const passwordValue = row[parentPasswordIndex]?.trim()
        parentPassword = passwordValue && passwordValue !== "" ? passwordValue : null

        if (!studentId || !studentName) {
          errors.push(`Row ${rowIndex + 3}: Missing student ID or name`)
          return
        }

        const scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[] = []

        subjectIndices.forEach(({ header, index }) => {
          const scoreStr = row[index]?.trim()
          const fullMarkStr = fullMarks[index]?.trim()

          // Check if student is absent for this subject (ONLY apply to subject columns)
          const absent = isAbsentScore(scoreStr)

          let score: number | null = null
          if (!absent) {
            score = scoreStr ? Number.parseFloat(scoreStr) : 0
            if (isNaN(score)) {
              errors.push(`Row ${rowIndex + 3}, ${header}: Invalid score "${scoreStr}"`)
              return
            }
          }

          const fullMark = fullMarkStr ? Number.parseFloat(fullMarkStr) : 100
          if (isNaN(fullMark)) {
            errors.push(`Full marks row, ${header}: Invalid full mark "${fullMarkStr}"`)
            return
          }

          scores.push({
            subject: header,
            score,
            full_mark: fullMark,
            absent,
          })

          if (absent) absentCount++
        })

        students.push({
          student_id: studentId,
          student_name: studentName,
          parent_password: parentPassword,
          scores,
        })
      })

      if (errors.length > 0) {
        setValidationErrors(errors)
        setMessage({ type: "error", text: `Found ${errors.length} validation errors. Please fix them before saving.` })
      } else {
        setValidationErrors([])
        setProcessedStudents(students)
        setMessage({
          type: "success",
          text: `Successfully parsed ${students.length} students with ${subjectIndices.length} subjects. Found ${absentCount} absent entries.`,
        })
      }
    } catch (error) {
      console.error("Processing error:", error)
      setMessage({ type: "error", text: "Error processing CSV data. Please check the file format." })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  })

  const handleSave = async () => {
    if (!context) {
      setMessage({ type: "error", text: "Please select an academic context first." })
      return
    }

    if (processedStudents.length === 0) {
      setMessage({ type: "error", text: "No valid student data to save." })
      return
    }

    setLoading(true)

    try {
      // Create or get academic context
      const { data: existingContext, error: contextError } = await supabase
        .from("academic_contexts")
        .select("id")
        .eq("school_id", context.school_id)
        .eq("year", context.year)
        .eq("term", context.term)
        .eq("grade", context.grade)
        .maybeSingle()

      let contextId: number

      if (existingContext) {
        contextId = existingContext.id
      } else {
        const { data: newContext, error: createError } = await supabase
          .from("academic_contexts")
          .insert({
            school_id: context.school_id,
            year: context.year,
            term: context.term,
            grade: context.grade,
          })
          .select("id")
          .single()

        if (createError) throw createError
        contextId = newContext.id
      }

      // Fetch all existing student_ids for this context
      const { data: existingStudents, error: checkError } = await supabase
        .from("student_results")
        .select("student_id")
        .eq("context_id", contextId)

      if (checkError) throw checkError

      const existingStudentIds = new Set(existingStudents?.map((s) => s.student_id) || [])
      const uploadedStudentIds = new Set(processedStudents.map((s) => s.student_id))

      // Determine which students are new, updated, and which to delete
      const newStudents = processedStudents.filter((s) => !existingStudentIds.has(s.student_id))
      const updatedStudents = processedStudents.filter((s) => existingStudentIds.has(s.student_id))
      const studentsToDelete = Array.from(existingStudentIds).filter((id) => !uploadedStudentIds.has(id))

      // Delete students not in the uploaded file
      let deletedCount = 0
      if (studentsToDelete.length > 0) {
        const { error: deleteError, count } = await supabase
          .from("student_results")
          .delete({ count: "exact" })
          .eq("context_id", contextId)
          .in("student_id", studentsToDelete)
        if (deleteError) throw deleteError
        deletedCount = count ?? studentsToDelete.length
      }

      // Prepare student results data
      const studentResults = processedStudents.map((student) => ({
        student_id: student.student_id,
        student_name: student.student_name,
        parent_password: student.parent_password,
        context_id: contextId,
        scores: student.scores,
      }))

      // Upsert student results (insert or update on conflict)
      const { error: upsertError } = await supabase
        .from("student_results")
        .upsert(studentResults, { onConflict: "student_id,context_id" })

      if (upsertError) throw upsertError

      // Count absent entries for reporting (for all students)
      const totalAbsent = processedStudents.reduce((count, student) => {
        return count + Object.values(student.scores).filter((score) => score.absent).length
      }, 0)

      setMessage({
        type: "success",
        text: `Saved ${studentResults.length} student results! (${newStudents.length} inserted, ${updatedStudents.length} updated, ${deletedCount} deleted, ${totalAbsent} absent entries)`,
      })

      // Clear the form
      setFile(null)
      setParsedData(null)
      setProcessedStudents([])
      setValidationErrors([])
    } catch (error: any) {
      console.error("Save error:", error)
      setMessage({ type: "error", text: `Error saving data: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const canSave = context && processedStudents.length > 0 && validationErrors.length === 0

  // Helper function to determine if a cell should be highlighted as absent (only for subject columns)
  const shouldHighlightAsAbsent = (rowIndex: number, cellIndex: number, cell: string): boolean => {
    if (rowIndex <= 1) return false // Don't highlight headers or full marks row

    const headers = parsedData?.[0] || []
    const header = headers[cellIndex]?.toLowerCase() || ""

    // Only highlight if it's a subject column (not id, name, or password)
    const nonSubjectColumns = ["id", "student_id", "student_name", "name", "parent_password", "password"]
    const isSubjectColumn = !nonSubjectColumns.some((col) => header.includes(col.toLowerCase()))

    return isSubjectColumn && isAbsentScore(cell)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Student Results</h1>
          <p className="text-gray-600 mt-2">
            Upload CSV files with student results data. Use "-" or leave empty for absent students in subject columns
            only.
          </p>
        </div>

        {/* Context Selection */}
        <div className="mb-6">
          <ContextSelector onContextChange={setContext} />
        </div>

        {/* Upload Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file with student results. <b>The first row must start with columns: "id", "student_name", "parent_password" (in this order), then subject columns.</b> Use "-" or leave empty for absent students in subject columns only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the CSV file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Drag and drop a CSV file here, or click to select</p>
                  <Button variant="outline">Choose File</Button>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200" : message.type === "success" ? "border-green-200" : ""}`}
          >
            {message.type === "error" && <AlertCircle className="h-4 w-4" />}
            {message.type === "success" && <CheckCircle className="h-4 w-4" />}
            {message.type === "info" && <Info className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Validation Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {parsedData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Review the parsed data before saving to database. Absent students (in subject columns) are highlighted
                in red.
                {processedStudents.length > 0 && (
                  <span className="ml-2">
                    <Badge variant="secondary">{processedStudents.length} students processed</Badge>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr
                        key={index}
                        className={index === 0 ? "bg-blue-50" : index === 1 ? "bg-yellow-50" : "bg-white"}
                      >
                        {row.map((cell, cellIndex) => {
                          const isAbsentCell = shouldHighlightAsAbsent(index, cellIndex, cell)
                          return (
                            <td
                              key={cellIndex}
                              className={`border border-gray-200 px-3 py-2 text-sm ${
                                isAbsentCell ? "bg-red-50 text-red-600" : ""
                              }`}
                            >
                              {cell || (isAbsentCell ? "ABSENT" : "-")}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">Showing first 10 rows of {parsedData.length} total rows</p>
              )}

              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setParsedData(null)
                    setProcessedStudents([])
                    setValidationErrors([])
                    setMessage(null)
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSave} disabled={loading || !canSave}>
                  {loading ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
