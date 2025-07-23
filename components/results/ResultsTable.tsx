"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { formatScore, getGradeLevel } from "@/utils/gradeUtils"
import { Download, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { StudentResult } from "@/types/student"

interface ResultsTableProps {
  student: StudentResult
  onExportPDF: () => void
  pdfLoading: boolean
  onEdit?: () => void // Add optional onEdit prop
  onDelete?: () => void // Add optional onDelete prop
}

export default function ResultsTable({ student, onExportPDF, pdfLoading, onEdit, onDelete }: ResultsTableProps) {
  const showGrade = student.grade < 7
  console.log(student);
  // Find subjects with score < 50 or absent
  const secondRoundSubjects = student.scores
    .filter((data) =>
      (data.absent) ||
      (typeof data.score === "number" && ((data.score / data.full_mark) * 100 ) < 50 && student.grade >= 3)
    )
    .map((data) => data.subject)

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl text-[#223152]">Student Results</CardTitle>
            <CardDescription className="mt-1 sm:mt-2">
              <div className="text-base sm:text-lg font-semibold break-words">{student.name}</div>
              <div className="text-xs sm:text-sm text-gray-600">Student ID: {student.id}</div>
            </CardDescription>
          </div>
          <div className="flex flex-col align-center sm:flex-row gap-2 w-full sm:w-auto">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
                onClick={onEdit}
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Edit Student
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Delete Student
              </Button>
            )}
            <Button 
              onClick={onExportPDF} 
              className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto text-xs sm:text-sm py-1 h-8 sm:h-9"
            >
              {pdfLoading ? <LoadingSpinner size="sm" className="mr-1 sm:mr-2" /> : <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
              Download PDF
            </Button>

          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 py-4 sm:py-6">
                {/* Second Round Exams message */}
        { secondRoundSubjects.length > 0 && (
          <div className="mt-2 mb-4 sm:mt-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 text-sm sm:text-base font-medium" dir="rtl" lang="ar">
            الرجاء التواصل مع المدرسة لحضور امتحانات الدور التاني في المواد التالية:
            <span className="font-semibold mx-1">{secondRoundSubjects.join("، ")}</span>
          </div>
        )}
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#223152] text-white">
                <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left">Subject</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">Full Mark</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">Student Mark</th>
                {showGrade && (
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">Grade</th>
                )}
              </tr>
            </thead>
            <tbody>
              {student.scores.map((data) => {
                const grade = getGradeLevel(data.score, data.full_mark, data.absent)

                return (
                  <tr key={data.subject} className="hover:bg-gray-50">
                    <td className="min-w-10 border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 font-medium">{data.subject}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">{data.full_mark}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
                      {data.absent ? <span className="text-gray-600 text-base sm:text-lg font-bold">-</span> : formatScore(data.score)}
                    </td>
                    {showGrade && (
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <Badge variant="secondary" className={`${grade.color} text-xs sm:text-sm`}>{grade.text}</Badge>
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
