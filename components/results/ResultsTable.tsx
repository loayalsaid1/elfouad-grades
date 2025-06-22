"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { formatScore, getGradeLevel, getGradeColor } from "@/utils/gradeUtils"
import { Download, User, FileText, AlertTriangle } from "lucide-react"
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
  console.log(student);
  // Find subjects with score < 50 or absent
  const secondRoundSubjects = student.scores
    .filter((data) =>
      (data.absent) ||
      (typeof data.score === "number" && ((data.score / data.full_mark) * 100 ) < 50 && student.grade >= 3)
    )
    .map((data) => data.subject)

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300 border-l-4 border-l-orange-500">
        <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1 flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-white text-xl break-words">{student.name}</CardTitle>
                <CardDescription className="text-blue-100 text-sm">Student ID: {student.id}</CardDescription>
              </div>
            </div>
            <Button 
              onClick={onExportPDF} 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto transition-all duration-300 hover:scale-105"
              variant="outline"
            >
              {pdfLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 border-white" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Second Round Exams Alert */}
      {secondRoundSubjects.length > 0 && (
        <Card className="shadow-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Second Round Exams Required
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-base font-medium text-yellow-900" dir="rtl" lang="ar">
              الرجاء التواصل مع المدرسة لحضور امتحانات الدور التاني في المواد التالية:
              <div className="mt-2 flex flex-wrap gap-2">
                {secondRoundSubjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-200 text-yellow-800 border border-yellow-300">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5" />
            </div>
            Academic Results
          </CardTitle>
          <CardDescription className="text-blue-100">
            Detailed breakdown of academic performance by subject
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-[#223152]">
                  <th className="border border-gray-300 px-4 py-3 text-left text-[#223152] font-semibold">Subject</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-[#223152] font-semibold">Full Mark</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-[#223152] font-semibold">Student Mark</th>
                  {showGrade && (
                    <th className="border border-gray-300 px-4 py-3 text-center text-[#223152] font-semibold">Grade</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {student.scores.map((data, index) => {
                  const grade = getGradeLevel(data.score, data.full_mark, data.absent)
                  // Use the original grade color system for border indicator
                  const gradeColor = getGradeColor(data.score, data.full_mark, data.absent)
                  
                  // Add background highlighting for score ranges
                  const percentage = data.absent ? 0 : typeof data.score === "number" ? ((data.score / data.full_mark) * 100) : 0
                  const isExcellent = !data.absent && percentage >= 95 // Blue for exceeds expectations
                  const isVeryGood = !data.absent && percentage >= 85 && percentage < 95 // Light green
                  const isGood = !data.absent && percentage >= 75 && percentage < 85 // Very light green
                  const isLowScore = !data.absent && percentage < 50 // Light red
                  const isMediumScore = !data.absent && percentage >= 50 && percentage < 75 // White/neutral

                  return (
                    <tr 
                      key={data.subject} 
                      className={`transition-all duration-200 hover:scale-[1.01] hover:shadow-sm ${
                        data.absent ? 'bg-red-50' : 
                        isExcellent ? 'bg-blue-50' : 
                        isVeryGood ? 'bg-green-50' : 
                        isGood ? 'bg-green-25' : 
                        isLowScore ? 'bg-yellow-50' : 
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="min-w-10 border border-gray-300 px-4 py-3 font-medium text-[#223152]">
                        {data.subject}
                        {data.absent && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">(Absent)</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-medium text-yellow-700 bg-yellow-50">
                        {data.full_mark}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-semibold relative">
                        {data.absent ? (
                          <div className="flex items-center justify-center">
                            <span className="text-gray-400 text-2xl font-bold transform scale-150">-</span>
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: gradeColor }}></div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center relative">
                            <span className="text-lg text-[#223152]">
                              {formatScore(data.score)}
                            </span>
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: gradeColor }}></div>
                          </div>
                        )}
                      </td>
                      {showGrade && (
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <Badge 
                            variant="secondary" 
                            className={`${grade.color} font-medium shadow-sm transition-all duration-200 hover:scale-105`}
                          >
                            {grade.text}
                          </Badge>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <div className="text-lg font-bold text-[#223152]">{student.scores.length}</div>
                <div className="text-xs text-gray-600">Total Subjects</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <div className="text-lg font-bold text-red-600">
                  {student.scores.filter(s => s.absent).length}
                </div>
                <div className="text-xs text-gray-600">Absent</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <div className="text-lg font-bold" style={{ color: '#1e3a8a' }}>
                  {student.scores.filter(s => !s.absent && typeof s.score === "number" && ((s.score / s.full_mark) * 100) >= 95).length}
                </div>
                <div className="text-xs text-gray-600">Exceeds Expectations</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <div className="text-lg font-bold text-yellow-600">
                  {secondRoundSubjects.length}
                </div>
                <div className="text-xs text-gray-600">Need Retake</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
