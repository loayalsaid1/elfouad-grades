"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { StudentResult } from "@/types/student"

interface StudentInfoProps {
  student: StudentResult
  onExportPDF: () => Promise<void>
  pdfLoading: boolean
}

export default function StudentInfo({ student, onExportPDF, pdfLoading }: StudentInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#223152]">{student.name}</CardTitle>
            <CardDescription>Student ID: {student.id}</CardDescription>
          </div>
          <Button onClick={onExportPDF} disabled={pdfLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {pdfLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export PDF
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
