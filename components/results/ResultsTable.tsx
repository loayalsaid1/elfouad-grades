"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { getGradeLevel } from "@/utils/gradeUtils"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { StudentResult } from "@/types/student"

interface ResultsTableProps {
  student: StudentResult
  onExportPDF: () => void
  pdfLoading: boolean
}

export default function ResultsTable({ student, onExportPDF, pdfLoading }: ResultsTableProps) {
  const showGrade = student.grade < 7

  // Find subjects with score < 50 and not absent
  const secondRoundSubjects = Object.entries(student.subjects)
    .filter(([_, data]) => !data.isAbsent && typeof data.score === "number" && data.score < 99)
    .map(([subject]) => subject)

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl text-[#223152]">Student Results</CardTitle>
            <CardDescription className="mt-2">
              <div className="text-lg font-semibold break-words">{student.name}</div>
              <div className="text-sm text-gray-600">Student ID: {student.id}</div>
            </CardDescription>
          </div>
          <Button onClick={onExportPDF} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
            {pdfLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
                {/* Second Round Exams message */}
        {secondRoundSubjects.length > 0 && (
          <div className="mt-6 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 text-base font-medium">
            You are required to attend the Second Round Exams in the following subjects:{" "}
            <span className="font-semibold">{secondRoundSubjects.join(", ")}</span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#223152] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left">Subject</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Full Mark</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Student Mark</th>
                {showGrade && (
                  <th className="border border-gray-300 px-4 py-3 text-center">Grade</th>
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(student.subjects).map(([subject, data]) => {
                const grade = getGradeLevel(data.score, data.isAbsent)

                return (
                  <tr key={subject} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium">{subject}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{data.fullMark}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      {data.isAbsent ? <span className="text-gray-600 text-lg font-bold">-</span> : data.score?.toFixed(2)}
                    </td>
                    {showGrade && (
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <Badge className={grade.color}>{grade.text}</Badge>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </CardContent>
    </Card>
  )
}
