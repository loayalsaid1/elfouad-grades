"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GRADE_REFERENCE_DATA } from "@/constants/grades"
import { Info } from "lucide-react"

export default function GradeReference() {
  return (
    <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <Info className="h-5 w-5" />
          </div>
          Grade Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GRADE_REFERENCE_DATA.map((grade, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: grade.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#223152]">{grade.textEn}</div>
                <div className="text-xs text-gray-500">{grade.range}</div>
              </div>
            </div>
          ))}

          {/* Add absent reference */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div className="w-4 h-4 rounded-full shadow-sm bg-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#223152]">Absent</div>
              <div className="text-xs text-gray-500">Not present</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
