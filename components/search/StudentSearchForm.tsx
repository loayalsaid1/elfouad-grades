"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface StudentSearchFormProps {
  onSearch: (studentId: string) => Promise<void> 
  loading: boolean
}

export default function StudentSearchForm({ onSearch, loading }: StudentSearchFormProps) {
  const [studentId, setStudentId] = useState("")

  const handleSearch = async () => {
    if (studentId.trim()) {
      await onSearch(studentId.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="mb-8">
      <Card
        className="
          border-l-4 border-l-[#223152]
          bg-white
          transition-all duration-300
          hover:border-l-[#3b5998] hover:bg-[#f5f7fa]
          shadow
        "
      >
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Search Student Results</span>
        </CardTitle>
        <CardDescription className="mt-1 text-sm sm:text-base">Enter the student's National ID to view exam results and generate reports</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Student's National ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={
              "flex-1 placeholder:text-[#3b5998] placeholder:text-sm placeholder:opacity-80 placeholder:italic h-10 sm:h-auto"
            }
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !studentId.trim() || onSearch === undefined}
            className="bg-[#223152] hover:bg-[#1a2642] w-full sm:w-auto h-10 sm:h-auto text-sm sm:text-base"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4 mr-1 sm:mr-2" />}
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
