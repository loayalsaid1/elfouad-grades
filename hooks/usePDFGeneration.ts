"use client"

import { useState } from "react"
import { PDFService } from "@/services/pdfService"
import type { StudentResult } from "@/types/student"

export function usePDFGeneration() {
  const [pdfLoading, setPdfLoading] = useState(false)

  const generatePDF = async (studentData: StudentResult) => {
    if (!studentData) return

    try {
      setPdfLoading(true)
      await PDFService.generateStudentReport(studentData)
    } catch (error) {
      console.error("Error generating PDF:", error)
      // You could add toast notification here
    } finally {
      setPdfLoading(false)
    }
  }

  return {
    pdfLoading,
    generatePDF,
  }
}
