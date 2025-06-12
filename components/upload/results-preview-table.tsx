"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ParsedStudent } from "@/types/supabase"
import { getGradeColor } from "@/utils/gradeUtils"

interface ResultsPreviewTableProps {
  students: ParsedStudent[]
  subjects: string[]
  fullMarks: Record<string, number>
}

export function ResultsPreviewTable({ students, subjects, fullMarks }: ResultsPreviewTableProps) {
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
                  const subjectScore = student.scores.find((s) => s.subject === subject)
                  const score = subjectScore?.score ?? 0
                  const fullMark = subjectScore?.full_mark ?? fullMarks[subject]
                  return (
                    <TableCell key={subject} className="text-center">
                      <Badge
                        style={{ backgroundColor: getGradeColor(score, fullMark) }}
                        className="text-white"
                      >
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
