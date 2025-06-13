"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Building2 } from "lucide-react"
import { useSystemStatus } from "@/contexts/SystemStatusContext"
import Image from "next/image"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import SystemDisabled from "@/components/SystemDisabled"

export default function HomePage() {
  const router = useRouter()
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  
  const { enabled, loading: systemStatusLoading } = useSystemStatus()

  if (systemStatusLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" className="w-18 h-18 border-4 border-cyan-500" />
      </div>
    )
  }
  if (!enabled) {
    return <SystemDisabled />
  }

  const schools = [
    {
      id: "international",
      name: "El-Fouad International School",
      description: "International curriculum with global standards",
      logo: "/El-Fouad Internsational School Logo .jpg",
    },
    {
      id: "modern",
      name: "El-Fouad Modern Schools",
      description: "Modern education with innovative teaching methods",
      logo: "/El-Fouad Modern Schools logo jpg.jpg",
    },
  ]

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId)
    router.push(`/${schoolId}`)
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-[#223152] p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">El-Fouad Schools</h1>
          <p className="text-xl text-gray-600 mb-2">Student Results Portal</p>
          <p className="text-lg text-gray-500">Select your school to view exam results</p>
        </div>

        {/* School Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {schools.map((school) => (
            <Card
              key={school.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-[#223152]"
              onClick={() => handleSchoolSelect(school.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg">
                    <Image
                      src={school.logo || "/placeholder.svg"}
                      alt={`${school.name} Logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-[#223152]">{school.name}</CardTitle>
                <CardDescription className="text-gray-600">{school.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-[#223152] hover:bg-[#1a2642] text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSchoolSelect(school.id)
                  }}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Select School
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Grade Selection</h3>
            <p className="text-gray-600 text-sm">Choose from grades 1-8 for your results</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">View your exam results immediately</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">PDF Reports</h3>
            <p className="text-gray-600 text-sm">Download official academic reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}
