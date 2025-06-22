"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User, Loader2 } from "lucide-react"

interface StudentSearchFormProps {
  onSearch?: (studentId: string) => Promise<void>
  loading?: boolean
}

export default function StudentSearchForm({ onSearch, loading = false }: StudentSearchFormProps) {
  const [studentId, setStudentId] = useState("")

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId.trim() && onSearch) {
      await onSearch(studentId.trim())
    }
  }, [studentId, onSearch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value)
  }, [])

  return (
    <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <User className="h-5 w-5" />
          </div>
          Student Search
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="student-id" className="text-sm font-medium text-[#223152]">
              Student National ID
            </label>
            <div className="relative">
              <Input
                id="student-id"
                type="text"
                placeholder="Enter student national ID"
                value={studentId}
                onChange={handleInputChange}
                disabled={loading || !onSearch}
                className="pl-10 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300 text-lg py-3"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!studentId.trim() || loading || !onSearch}
            className="w-full bg-[#223152] hover:bg-[#1a2642] text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Search Student
              </>
            )}
          </Button>
          
          {!onSearch && (
            <p className="text-sm text-orange-600 text-center font-medium bg-orange-50 p-2 rounded">
              Please select all academic context fields above to enable search
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
