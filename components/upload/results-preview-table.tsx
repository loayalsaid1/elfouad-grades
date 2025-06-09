"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ParsedStudent } from "@/types/supabase"

interface ResultsPreviewTableProps {
  students: ParsedStudent[]
  subjects: string[]
  fullMarks: Record<string, number>
}

export function ResultsPreviewTable({ students, subjects, fullMarks }: ResultsPreviewTableProps) {
  const getGradeColor = (score: number, fullMark: number) => {
    const percentage = (score / fullMark) * 100
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-blue-100 text-blue-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800"
    if (percentage >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-white">Student ID</TableHead>
              <TableHead className="sticky top-0 bg-white">Student Name</TableHead>
              <TableHead className="sticky top-0 bg-white">Parent Password</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject} className="sticky top-0 bg-white text-center">
                  {subject}
                  <div className="text-xs text-gray-500">/{fullMarks[subject]}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.slice(0, 10).map((student, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{student.student_id}</TableCell>
                <TableCell>{student.student_name}</TableCell>
                <TableCell>
                  {student.parent_password ? (
                    <Badge variant="secondary">Protected</Badge>
                  ) : (
                    <Badge variant="outline">Open</Badge>
                  )}
                </TableCell>
                {subjects.map((subject) => {
                  const score = student.scores[subject]?.score || 0
                  const fullMark = student.scores[subject]?.full_mark || fullMarks[subject]
                  return (
                    <TableCell key={subject} className="text-center">
                      <Badge className={getGradeColor(score, fullMark)}>
                        {score}/{fullMark}
                      </Badge>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {students.length > 10 && (
        <div className="p-3 bg-gray-50 text-sm text-gray-600 text-center">
          Showing first 10 of {students.length} students
        </div>
      )}
    </div>
  )
}
