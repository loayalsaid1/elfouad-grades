"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import type { CSVUploadContext } from "@/types/supabase"

interface UploadContextSelectorProps {
  onChange: (context: CSVUploadContext) => void
}

export function UploadContextSelector({ onChange }: UploadContextSelectorProps) {
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([])
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [term, setTerm] = useState<number>(1)
  const [grade, setGrade] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentSupabaseClient()

  // Memoize grade options to prevent re-rendering
  const gradeOptions = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => i + 1),
    []
  )

  useEffect(() => {
    let mounted = true
    
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase.from("schools").select("id, name").order("name")

        if (error) throw error
        if (mounted) {
          setSchools(data || [])
        }
      } catch (error) {
        console.error("Error fetching schools:", error)
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
  }, [supabase])

  // Debounced onChange to prevent excessive calls
  const debouncedOnChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (context: CSVUploadContext) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          onChange(context)
        }, 100)
      }
    })(),
    [onChange]
  )

  useEffect(() => {
    if (selectedSchool) {
      debouncedOnChange({
        school_id: selectedSchool,
        year,
        term,
        grade,
      })
    }
  }, [selectedSchool, year, term, grade, debouncedOnChange])

  if (loading) {
    return (
      <Card className="shadow-lg border-2 hover:border-[#223152] transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#223152] mr-2" />
            <span className="text-[#223152]">Loading schools...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-2 hover:border-[#223152] transition-all duration-300">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="school" className="text-[#223152] font-medium">School</Label>
            <Select onValueChange={(value) => setSelectedSchool(Number(value))}>
              <SelectTrigger className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
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
            <Label htmlFor="year" className="text-[#223152] font-medium">Academic Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min="2020"
              max="2030"
              className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term" className="text-[#223152] font-medium">Term</Label>
            <Select value={term.toString()} onValueChange={(value) => setTerm(Number(value))}>
              <SelectTrigger className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Term</SelectItem>
                <SelectItem value="2">Second Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-[#223152] font-medium">Grade</Label>
            <Select value={grade.toString()} onValueChange={(value) => setGrade(Number(value))}>
              <SelectTrigger className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((gradeNum) => (
                  <SelectItem key={gradeNum} value={gradeNum.toString()}>
                    Grade {gradeNum}
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
