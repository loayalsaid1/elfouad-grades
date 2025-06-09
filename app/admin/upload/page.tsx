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
  scores: Record<string, { score: number; full_mark: number }>
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

      // Validate headers
      const requiredColumns = ["student_id", "student_name"]
      const missingColumns = requiredColumns.filter(
        (col) =>
          !headers.some(
            (h) => h.toLowerCase().includes(col.toLowerCase()) || (col === "student_id" && h.toLowerCase() === "id"),
          ),
      )

      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(", ")}`)
      }

      // Find column indices
      const studentIdIndex = headers.findIndex((h) => h.toLowerCase() === "id" || h.toLowerCase() === "student_id")
      const studentNameIndex = headers.findIndex(
        (h) => h.toLowerCase() === "student_name" || h.toLowerCase() === "name",
      )
      const parentPasswordIndex = headers.findIndex(
        (h) => h.toLowerCase() === "parent_password" || h.toLowerCase() === "password",
      )

      if (studentIdIndex === -1) errors.push("Could not find student ID column (should be 'id' or 'student_id')")
      if (studentNameIndex === -1)
        errors.push("Could not find student name column (should be 'student_name' or 'name')")

      // Get subject columns (exclude known non-subject columns)
      const nonSubjectColumns = ["id", "student_id", "student_name", "name", "parent_password", "password"]
      const subjectIndices = headers
        .map((header, index) => ({ header: header.trim(), index }))
        .filter(({ header }) => header && !nonSubjectColumns.some((col) => header.toLowerCase() === col.toLowerCase()))

      if (subjectIndices.length === 0) {
        errors.push("No subject columns found")
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
        setMessage({ type: "error", text: "CSV validation failed. Please check the errors below." })
        return
      }

      // Process students
      const students: ParsedStudent[] = []

      studentRows.forEach((row, rowIndex) => {
        const studentId = row[studentIdIndex]?.trim()
        const studentName = row[studentNameIndex]?.trim()
        const parentPassword = parentPasswordIndex >= 0 ? row[parentPasswordIndex]?.trim() || null : null

        if (!studentId || !studentName) {
          errors.push(`Row ${rowIndex + 3}: Missing student ID or name`)
          return
        }

        const scores: Record<string, { score: number; full_mark: number }> = {}

        subjectIndices.forEach(({ header, index }) => {
          const scoreStr = row[index]?.trim()
          const fullMarkStr = fullMarks[index]?.trim()

          const score = scoreStr ? Number.parseFloat(scoreStr) : 0
          const fullMark = fullMarkStr ? Number.parseFloat(fullMarkStr) : 100

          if (isNaN(score)) {
            errors.push(`Row ${rowIndex + 3}, ${header}: Invalid score "${scoreStr}"`)
            return
          }

          if (isNaN(fullMark)) {
            errors.push(`Full marks row, ${header}: Invalid full mark "${fullMarkStr}"`)
            return
          }

          scores[header] = { score, full_mark: fullMark }
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
          text: `Successfully parsed ${students.length} students with ${subjectIndices.length} subjects.`,
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

      // Check for existing students in this context
      const { data: existingStudents, error: checkError } = await supabase
        .from("student_results")
        .select("student_id")
        .eq("context_id", contextId)

      if (checkError) throw checkError

      const existingStudentIds = new Set(existingStudents?.map((s) => s.student_id) || [])
      const newStudents = processedStudents.filter((s) => !existingStudentIds.has(s.student_id))
      const duplicateStudents = processedStudents.filter((s) => existingStudentIds.has(s.student_id))

      if (duplicateStudents.length > 0) {
        setMessage({
          type: "error",
          text: `Found ${duplicateStudents.length} students that already exist in this context. Please remove duplicates or use a different context.`,
        })
        setLoading(false)
        return
      }

      // Prepare student results data
      const studentResults = newStudents.map((student) => ({
        student_id: student.student_id,
        student_name: student.student_name,
        parent_password: student.parent_password,
        context_id: contextId,
        scores: student.scores,
      }))

      // Insert student results
      const { error: insertError } = await supabase.from("student_results").insert(studentResults)

      if (insertError) throw insertError

      setMessage({
        type: "success",
        text: `Successfully saved ${studentResults.length} student results to the database!`,
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Student Results</h1>
          <p className="text-gray-600 mt-2">Upload CSV files with student results data</p>
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
              Upload a CSV file with student results. Required columns: student_id (or id), student_name, then subject
              columns. Optional: parent_password column.
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
                Review the parsed data before saving to database
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
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-sm">
                            {cell || "-"}
                          </td>
                        ))}
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
