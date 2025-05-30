import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGradeLevel } from "@/utils/gradeUtils"
import type { StudentResult } from "@/types/student"

interface ResultsTableProps {
  student: StudentResult
}

export default function ResultsTable({ student }: ResultsTableProps) {
  return (
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
              {Object.entries(student.subjects).map(([subject, data]) => {
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
  )
}
