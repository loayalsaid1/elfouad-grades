"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Settings } from "lucide-react"
import { useAdminUser } from "@/hooks/useAdminUser"

interface ContextSelectorProps {
  onContextChange: (
    context: {
      school_id: number
      year: number
      term: number
      grade: number
    } | null,
  ) => void
}

export function ContextSelector({ onContextChange }: ContextSelectorProps) {
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedGrade, setSelectedGrade] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentSupabaseClient()
  const { profile, schoolAccess } = useAdminUser()

  // Memoize options to prevent re-renders and get current year
  const { yearOptions, currentAcademicYear } = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // 1-12
    
    // Academic year starts in September (month 9)
    // If we're in Jan-Aug, we're in the second half of the academic year
    // If we're in Sep-Dec, we're in the first half of the academic year
    const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1
    
    const years = Array.from({ length: currentYear + 5 - 2004 + 1 }, (_, i) => 2004 + i)
    
    return {
      yearOptions: years,
      currentAcademicYear: academicYear
    }
  }, [])

  const gradeOptions = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => i + 1),
    []
  )

  // Set default year to current academic year on component mount
  useEffect(() => {
    if (!selectedYear && currentAcademicYear) {
      setSelectedYear(currentAcademicYear.toString())
    }
  }, [currentAcademicYear, selectedYear])

  // Fetch schools on component mount
  useEffect(() => {
    let mounted = true

    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase.from("schools").select("id, name").order("name")
        if (error) throw error
        if (mounted) {
          // Filter by schoolAccess if not super admin
          let filtered = data || []
          if (profile && !profile.is_super_admin) {
            filtered = filtered.filter((s: any) => schoolAccess.includes(s.id))
          }
          setSchools(filtered)
        }
      } catch (err: any) {
        if (mounted) {
          setError(`Failed to load schools: ${err.message}`)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSchools()
    
    return () => {
      mounted = false
    }
  }, [supabase, profile, schoolAccess])

  // Debounced context change to prevent excessive updates
  const debouncedOnContextChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (context: { school_id: number; year: number; term: number; grade: number } | null) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          onContextChange(context)
        }, 100)
      }
    })(),
    [onContextChange]
  )

  // Update parent component when context changes
  useEffect(() => {
    if (selectedSchool && selectedYear && selectedTerm && selectedGrade) {
      debouncedOnContextChange({
        school_id: Number.parseInt(selectedSchool),
        year: Number.parseInt(selectedYear),
        term: Number.parseInt(selectedTerm),
        grade: Number.parseInt(selectedGrade),
      })
    } else {
      debouncedOnContextChange(null)
    }
  }, [selectedSchool, selectedYear, selectedTerm, selectedGrade, debouncedOnContextChange])

  if (loading) {
    return (
      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#223152] mr-2" />
            <span className="text-[#223152] font-medium">Loading schools...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-xl border-2 border-red-200">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <Settings className="h-5 w-5" />
          </div>
          Select Academic Context
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="school" className="text-[#223152] font-medium">School *</Label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger id="school" className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-[#223152] font-medium">Academic Year *</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year" className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px] overflow-y-auto"
                onOpenAutoFocus={(e) => {
                  // Auto-scroll to current year when dropdown opens
                  const currentYearElement = e.currentTarget.querySelector(`[data-value="${currentAcademicYear}"]`)
                  if (currentYearElement) {
                    currentYearElement.scrollIntoView({ block: "center" })
                  }
                }}
              >
                {yearOptions.map((year) => (
                  <SelectItem 
                    key={year} 
                    value={year.toString()}
                    data-value={year}
                    className={year === currentAcademicYear ? "bg-blue-50 font-medium" : ""}
                  >
                    {year}-{year + 1} {year === currentAcademicYear && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term" className="text-[#223152] font-medium">Term *</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger id="term" className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Term</SelectItem>
                <SelectItem value="2">Second Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-[#223152] font-medium">Grade *</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger id="grade" className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
