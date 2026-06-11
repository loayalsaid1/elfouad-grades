import { pdf } from "@react-pdf/renderer"
import type { StudentResult } from "@/types/student"
import StudentReport from "@/components/pdf/StudentReport"
import React from "react"

export class PDFService {
  static async generateStudentReport(studentData: StudentResult): Promise<void> {
    try {
      const reportData =
        typeof structuredClone === "function"
          ? structuredClone(studentData)
          : JSON.parse(JSON.stringify(studentData))

      if (!reportData || typeof reportData.id !== "string" || reportData.id.trim() === "") {
        throw new Error("Invalid student data: missing student ID")
      }

      if (!Array.isArray(reportData.scores)) {
        throw new Error("Invalid student data: missing student scores")
      }

      // Generate PDF on client side
      const blob = await pdf(React.createElement(StudentReport, { studentData: reportData })).toBlob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${reportData.name || reportData.id}_Report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.log("Student data causing error:", studentData)
      console.error("Error generating PDF:", error)
      throw new Error("Failed to generate PDF")
    }
  }
}
