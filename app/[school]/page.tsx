"use client"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowLeft, BookOpen } from "lucide-react"
import { getOrdinalInfo } from "@/utils/gradeUtils"
import Image from "next/image"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useSchool } from "@/hooks/useSchool"

export default function SchoolPage() {
  const router = useRouter()
  const params = useParams()
  const schoolSlug = params?.school as string

  const { school, loading, error } = useSchool(schoolSlug)

  const handleGradeSelect = (grade: number) => {
    router.push(`/${schoolSlug}/${grade}`)
  }

  const handleBack = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" className="w-18 h-18 border-4 border-cyan-500" />
      </div>
    )
  }

  if (!school && !loading) {
    return <div className="text-center py-12">School not found</div>
  }

  if (!school) {
    return null // Still loading, let the loading state handle it
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-blue-50 h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Button variant="outline" onClick={handleBack} className="mb-8 hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Schools
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg">
              <Image
                src={school.logo ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/schools-logos/${school.logo}` : "/placeholder.svg"}
                alt={`${school.name} Logo`}
                fill
                className="object-contain p-2"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{school.name}</h1>
          <p className="text-xl text-gray-600 mb-2">Grade Selection</p>
          <p className="text-lg text-gray-500">Choose your grade to view exam results</p>
        </div>

        {/* Grade Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((grade) => {
            const ordinalInfo = getOrdinalInfo(grade)
            return (
              <Card
                key={grade}
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-[#223152]"
                onClick={() => handleGradeSelect(grade)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <div className="bg-[#223152] p-3 rounded-full">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#223152]">{ordinalInfo.ordinal}</CardTitle>
                  <CardDescription className="text-gray-600 capitalize">{ordinalInfo.word} Grade</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    className="w-full bg-[#223152] hover:bg-[#1a2642] text-white text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGradeSelect(grade)
                    }}
                  >
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Select
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Year 2024-2025</h3>
            <p className="text-gray-600 mb-4">
              Select your grade to access exam results and generate official academic reports.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <strong>Term:</strong> Second Term
              </div>
              <div>
                <strong>School:</strong> {school.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
