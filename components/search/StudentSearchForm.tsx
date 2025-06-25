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
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Student Results</span>
        </CardTitle>
        <CardDescription>Enter the student's National ID to view exam results and generate reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Student's National ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={
              "flex-1 placeholder:text-[#3b5998]  placeholder:text-sm placeholder:opacity-80 placeholder:italic"
            }
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !studentId.trim() || onSearch === undefined}
            className="bg-[#223152] hover:bg-[#1a2642] w-full sm:w-auto"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
