"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Building2 } from "lucide-react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import Image from "next/image"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import SystemDisabled from "@/components/SystemDisabled"
import { useSystemStatus } from "@/contexts/SystemStatusContext"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const { enabled, loading: systemStatusLoading } = useSystemStatus()

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("schools").select("*").order("name")
      if (error) throw error
      setSchools(data || [])
    } catch (err: any) {
      console.error("Failed to fetch schools:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId)
    router.push(`/${schoolId}`)
  }

  if (systemStatusLoading || loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-blue-50">
        <LoadingSpinner size="lg" className="w-18 h-18 border-4 border-cyan-500" />
      </div>
    )
  }

  if (!enabled) {
    return <SystemDisabled />
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-blue-50 min-h-full">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="bg-[#223152] p-3 md:p-4 rounded-full">
              <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">El-Fouad Schools</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">Student Results Portal</p>
          <p className="text-base md:text-lg text-gray-500 px-2">Select your school to view exam results</p>
        </div>

        {/* School Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {schools.map((school) => (
            <Card
              key={school.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-[#223152]"
              onClick={() => handleSchoolSelect(school.slug)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg">
                    <Image
                      src={school.logo ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/schools-logos/${school.logo}` : "/placeholder.svg"}
                      alt={`${school.name} Logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-[#223152]">{school.name}</CardTitle>
                <CardDescription className="text-gray-600">{school.description || "No description available"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-[#223152] hover:bg-[#1a2642] text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSchoolSelect(school.slug)
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
        <div className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
          <div className="text-center p-4 bg-white/50 rounded-lg shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Grade Selection</h3>
            <p className="text-gray-600 text-sm">Choose from grades 1-8 for your results</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-lg shadow-sm">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Instant Results</h3>
            <p className="text-gray-600 text-sm">View your exam results immediately</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-lg shadow-sm">
            <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">PDF Reports</h3>
            <p className="text-gray-600 text-sm">Download official academic reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}
