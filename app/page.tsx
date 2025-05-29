"use client"

import { useState } from "react"
import { Search, Download, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { pdf } from "@react-pdf/renderer"
import StudentReport from "@/components/student-report"

interface StudentResult {
  id: string
  name: string
  subjects: {
    [key: string]: {
      score: number
      fullMark: number
    }
  }
}

const gradeColors = {
  excellent: "bg-blue-100 text-blue-800 border-blue-200",
  good: "bg-green-100 text-green-800 border-green-200",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
  poor: "bg-red-100 text-red-800 border-red-200",
  absent: "bg-gray-100 text-gray-800 border-gray-200",
}

const getGradeLevel = (score: number, fullMark: number) => {
  const percentage = score // The score is already a percentage in this dataset
  if (percentage >= 85) return { level: "excellent", text: "يفوق التوقعات", color: gradeColors.excellent }
  if (percentage >= 65) return { level: "good", text: "يلبي التوقعات", color: gradeColors.good }
  if (percentage >= 50) return { level: "fair", text: "يلبي التوقعات أحياناً", color: gradeColors.fair }
  return { level: "poor", text: "أقل من المتوقع", color: gradeColors.poor }
}

export default function HomePage() {
  const [studentId, setStudentId] = useState("")
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchStudent = async () => {
    if (!studentId.trim()) {
      setError("Please enter a student ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (!response.ok) {
        throw new Error("Student not found")
      }
      const data = await response.json()
      setStudentResult(data)
    } catch (err) {
      setError("Student not found. Please check the ID and try again.")
      setStudentResult(null)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!studentResult) return

    try {
      // Generate PDF on client side
      const blob = await pdf(<StudentReport studentData={studentResult} />).toBlob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${studentResult.name}_Report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error generating PDF:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="ltr">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo.png" alt="El Fouad Schools" width={60} height={60} className="rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-[#223152]">El Fouad Schools</h1>
                <p className="text-sm text-gray-600">Student Results Portal</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-[#223152]">
              <GraduationCap className="w-6 h-6" />
              <span className="font-medium">6th Grade Results</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-[#223152]">Search Student Results</CardTitle>
              <CardDescription>Enter the student ID to view exam results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter Student ID (e.g., 65)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchStudent()}
                  className="flex-1"
                />
                <Button onClick={searchStudent} disabled={loading} className="bg-[#223152] hover:bg-[#1a2642]">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {studentResult && (
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#223152]">{studentResult.name}</CardTitle>
                    <CardDescription>Student ID: {studentResult.id}</CardDescription>
                  </div>
                  <Button onClick={generatePDF} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Grade Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grade Reference / مرجع الدرجات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div className="text-sm">
                      <div className="font-medium">يفوق التوقعات</div>
                      <div className="text-gray-600">85-100</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <div className="text-sm">
                      <div className="font-medium">يلبي التوقعات</div>
                      <div className="text-gray-600">65-84</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <div className="text-sm">
                      <div className="font-medium">يلبي التوقعات أحياناً</div>
                      <div className="text-gray-600">50-64</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div className="text-sm">
                      <div className="font-medium">أقل من المتوقع</div>
                      <div className="text-gray-600">{"<50"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Results / نتائج الامتحان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-[#223152] text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left">Subject</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Full Mark</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Student Mark</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(studentResult.subjects).map(([subject, data]) => {
                        const grade = getGradeLevel(data.score, data.fullMark)

                        return (
                          <tr key={subject} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">{subject}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center">{data.fullMark}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                              {data.score.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              <Badge className={grade.color}>{grade.text}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
