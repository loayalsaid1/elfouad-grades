"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { memo } from "react"
import type { ParsedStudent } from "@/types/supabase"
import { getGradeColor } from "@/utils/gradeUtils"

interface ResultsPreviewTableProps {
  students: ParsedStudent[]
  subjects: string[]
  fullMarks: Record<string, number>
}

// Memoize the table row component to prevent unnecessary re-renders
const StudentRow = memo(({ 
  student, 
  subjects, 
  fullMarks, 
  index 
}: { 
  student: ParsedStudent
  subjects: string[]
  fullMarks: Record<string, number>
  index: number
}) => (
  <TableRow className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
    <TableCell className="font-medium text-[#223152]">{student.student_id}</TableCell>
    <TableCell className="font-medium">{student.student_name}</TableCell>
    <TableCell>
      {student.parent_password ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">Protected</Badge>
      ) : (
        <Badge variant="outline" className="border-orange-200 text-orange-700">Open</Badge>
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
            className="text-white font-medium shadow-sm"
          >
            {score}/{fullMark}
          </Badge>
        </TableCell>
      )
    })}
  </TableRow>
))

StudentRow.displayName = 'StudentRow'

export function ResultsPreviewTable({ students, subjects, fullMarks }: ResultsPreviewTableProps) {
  // Only show first 10 students to improve performance
  const displayStudents = students.slice(0, 10)
  
  return (
    <div className="border-2 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#223152] to-[#2a3f66]">
              <TableHead className="sticky top-0 bg-[#223152] text-white font-semibold">Student ID</TableHead>
              <TableHead className="sticky top-0 bg-[#223152] text-white font-semibold">Student Name</TableHead>
              <TableHead className="sticky top-0 bg-[#223152] text-white font-semibold">Parent Password</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject} className="sticky top-0 bg-[#223152] text-white text-center font-semibold">
                  {subject}
                  <div className="text-xs text-blue-100">/{fullMarks[subject]}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStudents.map((student, index) => (
              <StudentRow
                key={student.student_id}
                student={student}
                subjects={subjects}
                fullMarks={fullMarks}
                index={index}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      {students.length > 10 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 text-sm text-[#223152] text-center font-medium border-t">
          Showing first 10 of {students.length} students
        </div>
      )}
    </div>
  )
}

ResultsPreviewTable.displayName = 'ResultsPreviewTable'
