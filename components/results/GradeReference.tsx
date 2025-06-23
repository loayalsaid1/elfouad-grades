import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GRADE_REFERENCE_DATA } from "@/constants/grades"

export default function GradeReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Grade Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GRADE_REFERENCE_DATA.map((grade, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: grade.color }}></div>
              <div className="text-sm">
                <div className="font-medium">{grade.textEn}</div>
                <div className="text-gray-600">{grade.range}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
