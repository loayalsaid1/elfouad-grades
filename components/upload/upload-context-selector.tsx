"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase.from("schools").select("id, name").order("name")

        if (error) throw error
        setSchools(data || [])
      } catch (error) {
        console.error("Error fetching schools:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [supabase])

  useEffect(() => {
    if (selectedSchool) {
      onChange({
        school_id: selectedSchool,
        year,
        term,
        grade,
      })
    }
  }, [selectedSchool, year, term, grade, onChange])

  if (loading) {
    return <div>Loading schools...</div>
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Select onValueChange={(value) => setSelectedSchool(Number(value))}>
              <SelectTrigger>
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
            <Label htmlFor="year">Academic Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Term</Label>
            <Select value={term.toString()} onValueChange={(value) => setTerm(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Term</SelectItem>
                <SelectItem value="2">Second Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select value={grade.toString()} onValueChange={(value) => setGrade(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((gradeNum) => (
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
