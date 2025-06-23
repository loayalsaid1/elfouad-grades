import { useState, useCallback } from "react"
import Papa from "papaparse"

interface ParsedStudent {
  student_id: string
  student_name: string
  parent_password: string | null
  scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[]
}

interface UseCSVParserReturn {
  parsedData: string[][] | null
  processedStudents: ParsedStudent[]
  validationErrors: string[]
  parseCSV: (file: File) => void
  clearData: () => void
  isAbsentScore: (value: string) => boolean
}

export function useCSVParser(): UseCSVParserReturn {
  const [parsedData, setParsedData] = useState<string[][] | null>(null)
  const [processedStudents, setProcessedStudents] = useState<ParsedStudent[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Helper function to check if a value indicates absence (ONLY for subject scores)
  const isAbsentScore = useCallback((value: string): boolean => {
    if (!value) return true
    const trimmed = value.trim().toLowerCase()
    return trimmed === "" || trimmed === "-" || trimmed === "absent" || trimmed === "غائب"
  }, [])

  const processCSVData = useCallback((data: string[][]) => {
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
        return
      }

      // Process students
      const students: ParsedStudent[] = []

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
      } else {
        setValidationErrors([])
        setProcessedStudents(students)
      }
    } catch (error) {
      console.error("Processing error:", error)
      setValidationErrors(["Error processing CSV data. Please check the file format."])
    }
  }, [isAbsentScore])

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][]

        // Filter out empty rows
        const filteredData = data.filter((row) => row.some((cell) => cell && cell.trim() !== ""))

        if (filteredData.length < 3) {
          setValidationErrors(["CSV must have at least 3 rows: headers, full marks, and student data."])
          return
        }

        setParsedData(filteredData)
        processCSVData(filteredData)
      },
      header: false,
      skipEmptyLines: true,
    })
  }, [processCSVData])

  const clearData = useCallback(() => {
    setParsedData(null)
    setProcessedStudents([])
    setValidationErrors([])
  }, [])

  return {
    parsedData,
    processedStudents,
    validationErrors,
    parseCSV,
    clearData,
    isAbsentScore,
  }
}
