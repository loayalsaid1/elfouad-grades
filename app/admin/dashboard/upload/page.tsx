"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react"
import { ContextSelector } from "@/components/admin/context-selector"
import Papa from "papaparse"
import { useAdminUser } from "@/hooks/useAdminUser"
import BackToDashboard from "@/components/admin/BackToDashboard"
import LoadingPage from "@/components/admin/LoadingPage"

interface ParsedStudent {
  student_id: string
  student_name: string
  parent_password: string | null
  scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[]
}

interface apge {
  school_id: number
  year: number
  term: number
  grade: number
}

export default function UploadPage() {
  const user = useAdminUser()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<string[][] | null>(null)
  const [processedStudents, setProcessedStudents] = useState<ParsedStudent[]>([])
  const [context, setContext] = useState<UploadContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const supabase = createClientComponentSupabaseClient()

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

          // Skip if value is "N/A"
          if (scoreStr?.toLowerCase() === "n/a") {
            return
          }

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

  if (!user) {
    return <LoadingPage message="Loading upload page..." />
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <BackToDashboard />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-3 rounded-full mr-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            Upload Student Results
          </h1>
          <p className="text-gray-600 mt-2">
            Upload CSV files with student results data. Use "-" or leave empty for absent students in subject columns only.
          </p>
        </div>

        {/* CSV Format Instructions */}
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Info className="h-5 w-5" />
              </div>
              How to format your CSV file
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">Follow these steps to prepare your file:</span>
            </div>
            <ol className="list-decimal list-inside text-sm text-[#223152] space-y-3 pl-4">
              <li>
                <b>First row:</b> Start with <code className="bg-blue-100 px-2 py-1 rounded font-mono">id</code>,{" "}
                <code className="bg-blue-100 px-2 py-1 rounded font-mono">student_name</code>,{" "}
                <code className="bg-blue-100 px-2 py-1 rounded font-mono">parent_password</code>, then one column for each subject
                (e.g. <code className="bg-blue-100 px-2 py-1 rounded font-mono">Arabic</code>,{" "}
                <code className="bg-blue-100 px-2 py-1 rounded font-mono">Religion</code>,{" "}
                <code className="bg-blue-100 px-2 py-1 rounded font-mono">Math</code>, ...).
              </li>
              <li>
                <b>Second row:</b> Enter the{" "}
                <span className="font-semibold text-[#223152]">full mark</span> for each subject (first three columns can be blank).
              </li>
              <li>
                <b>Each following row:</b> Fill in student info and their scores for each subject.
              </li>
              <li>
                For <span className="font-semibold text-red-600">absent students</span> in a subject, use{" "}
                <code className="bg-red-100 px-2 py-1 rounded font-mono text-red-700">-</code> in that cell.
              </li>
              <li>
                If a student <span className="font-semibold text-orange-600">does not take a subject at all</span>, use{" "}
                <code className="bg-orange-100 px-2 py-1 rounded font-mono text-orange-700">N/A</code> in that cell.
              </li>
            </ol>
            <div className="overflow-x-auto mt-6 bg-white rounded-lg border-2 border-blue-200 shadow-inner">
              <table className="min-w-max text-xs">
                <tbody>
                  <tr className="bg-gradient-to-r from-blue-100 to-blue-200">
                    <td className="border border-blue-300 px-3 py-2 font-semibold">id</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">student_name</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">parent_password</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">Arabic</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">Religion</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">Math</td>
                    <td className="border border-blue-300 px-3 py-2 font-semibold">Science</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border border-blue-200 px-3 py-2 text-gray-400">-</td>
                    <td className="border border-blue-200 px-3 py-2 text-gray-400">-</td>
                    <td className="border border-blue-200 px-3 py-2 text-gray-400">-</td>
                    <td className="border border-blue-200 px-3 py-2 font-semibold text-yellow-700">100</td>
                    <td className="border border-blue-200 px-3 py-2 font-semibold text-yellow-700">100</td>
                    <td className="border border-blue-200 px-3 py-2 font-semibold text-yellow-700">100</td>
                    <td className="border border-blue-200 px-3 py-2 font-semibold text-yellow-700">100</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-blue-200 px-3 py-2">123</td>
                    <td className="border border-blue-200 px-3 py-2">Ali Ahmed</td>
                    <td className="border border-blue-200 px-3 py-2">pw123</td>
                    <td className="border border-blue-200 px-3 py-2">90</td>
                    <td className="border border-blue-200 px-3 py-2">96</td>
                    <td className="border border-blue-200 px-3 py-2">95</td>
                    <td className="border border-blue-200 px-3 py-2 bg-red-50 text-red-600 font-semibold">-</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-blue-200 px-3 py-2">124</td>
                    <td className="border border-blue-200 px-3 py-2">Sara Fathy</td>
                    <td className="border border-blue-200 px-3 py-2 text-gray-400">-</td>
                    <td className="border border-blue-200 px-3 py-2">98</td>
                    <td className="border border-blue-200 px-3 py-2">100</td>
                    <td className="border border-blue-200 px-3 py-2">90</td>
                    <td className="border border-blue-200 px-3 py-2">96</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="border border-blue-200 px-3 py-2">125</td>
                    <td className="border border-blue-200 px-3 py-2">Mohamed Samir</td>
                    <td className="border border-blue-200 px-3 py-2">pw999</td>
                    <td className="border border-blue-200 px-3 py-2">89</td>
                    <td className="border border-blue-200 px-3 py-2">100</td>
                    <td className="border border-blue-200 px-3 py-2 bg-orange-50 text-orange-600 font-semibold">N/A</td>
                    <td className="border border-blue-200 px-3 py-2">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Context Selection */}
        <div className="mb-6">
          <ContextSelector onContextChange={setContext} />
        </div>

        {/* Upload Area */}
        <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
            <CardTitle className="text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <Upload className="h-5 w-5" />
              </div>
              Select CSV File
            </CardTitle>
            <CardDescription className="text-blue-100">
              Upload a CSV file with student results. <b>The first row must start with columns: "id", "student_name", "parent_password" (in this order), then subject columns.</b> Use "-" or leave empty for absent students in subject columns only.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? "border-[#223152] bg-blue-50 scale-[1.02]" 
                  : "border-gray-300 hover:border-[#223152] hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  isDragActive ? "bg-[#223152] scale-110" : "bg-gray-100 hover:bg-[#223152] hover:scale-110"
                }`}>
                  <Upload className={`h-8 w-8 transition-colors duration-300 ${
                    isDragActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`} />
                </div>
                <div className="space-y-2">
                  {isDragActive ? (
                    <p className="text-lg font-medium text-[#223152]">Drop the CSV file here...</p>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-[#223152] mb-2">Drag and drop a CSV file here, or click to select</p>
                      <Button variant="outline" className="border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white">
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-6 flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 animate-in slide-in-from-top-2 duration-300">
                <FileText className="h-6 w-6 text-[#223152] mr-3" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#223152]">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert
            className={`mb-6 shadow-lg animate-in slide-in-from-top-2 duration-300 ${
              message.type === "error" 
                ? "border-red-200 bg-red-50" 
                : message.type === "success" 
                  ? "border-green-200 bg-green-50" 
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            {message.type === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
            {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {message.type === "info" && <Info className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={`font-medium ${
              message.type === "error" 
                ? "text-red-800" 
                : message.type === "success" 
                  ? "text-green-800" 
                  : "text-blue-800"
            }`}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="mb-6 border-2 border-red-200 shadow-xl animate-in slide-in-from-top-2 duration-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="text-white flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <AlertCircle className="h-5 w-5" />
                </div>
                Validation Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-red-50">
              <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index} className="font-medium">{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {parsedData && (
          <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
              <CardTitle className="text-white flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                Data Preview
              </CardTitle>
              <CardDescription className="text-blue-100">
                Review the parsed data before saving to database. Absent students (in subject columns) are highlighted in red.
                {processedStudents.length > 0 && (
                  <span className="ml-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {processedStudents.length} students processed
                    </Badge>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto border-2 rounded-lg shadow-inner">
                <table className="min-w-full border-collapse">
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr
                        key={index}
                        className={`transition-colors duration-200 ${
                          index === 0 
                            ? "bg-gradient-to-r from-blue-100 to-blue-200" 
                            : index === 1 
                              ? "bg-gradient-to-r from-yellow-100 to-yellow-200" 
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {row.map((cell, cellIndex) => {
                          const isAbsentCell = shouldHighlightAsAbsent(index, cellIndex, cell)
                          return (
                            <td
                              key={cellIndex}
                              className={`border border-gray-200 px-3 py-2 text-sm transition-colors duration-200 ${
                                isAbsentCell ? "bg-red-100 text-red-700 font-semibold" : ""
                              } ${
                                index === 0 ? "font-semibold text-blue-800" : 
                                index === 1 ? "font-semibold text-yellow-800" : ""
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
                <p className="text-sm text-gray-500 mt-3 text-center font-medium">
                  Showing first 10 rows of {parsedData.length} total rows
                </p>
              )}

              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setParsedData(null)
                    setProcessedStudents([])
                    setValidationErrors([])
                    setMessage(null)
                  }}
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !canSave}
                  className="bg-[#223152] hover:bg-[#1a2642] text-white min-w-[150px] font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save to Database
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
