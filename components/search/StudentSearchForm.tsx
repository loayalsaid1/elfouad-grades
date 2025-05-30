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
  error: string
}

export default function StudentSearchForm({ onSearch, loading, error }: StudentSearchFormProps) {
  const [studentId, setStudentId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId.trim()) {
      await onSearch(studentId.trim())
    }
  }

  return (
    <div className="mb-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-[#223152]">Search Student Results</CardTitle>
          <CardDescription>Enter the student ID to view exam results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              placeholder="Enter Student ID (e.g., 65)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={loading} className="bg-[#223152] hover:bg-[#1a2642]">
              {loading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
