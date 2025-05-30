import { pdf } from "@react-pdf/renderer"
import type { StudentResult } from "@/types/student"
import StudentReport from "@/components/pdf/StudentReport"
import React from "react"

export class PDFService {
  static async generateStudentReport(studentData: StudentResult): Promise<void> {
    try {
      // Generate PDF on client side
      const blob = await pdf(React.createElement(StudentReport, { studentData })).toBlob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${studentData.name}_Report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw new Error("Failed to generate PDF")
    }
  }
}
