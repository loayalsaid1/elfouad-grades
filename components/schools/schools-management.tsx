"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, AlertCircle, CheckCircle } from "lucide-react"

export function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<any | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClientComponentSupabaseClient()

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("schools").select("*").order("name")

      if (error) throw error

      setSchools(data || [])
    } catch (err: any) {
      setError(`Failed to load schools: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchool = () => {
    setEditingSchool(null)
    setSchoolName("")
    setIsDialogOpen(true)
  }

  const handleEditSchool = (school: any) => {
    setEditingSchool(school)
    setSchoolName(school.name)
    setIsDialogOpen(true)
  }

  const handleSaveSchool = async () => {
    if (!schoolName.trim()) return

    try {
      setIsSaving(true)
      setError(null)

      if (editingSchool) {
        // Update existing school
        const { error } = await supabase.from("schools").update({ name: schoolName.trim() }).eq("id", editingSchool.id)

        if (error) throw error

        setSuccess(`School "${schoolName}" updated successfully`)
      } else {
        // Add new school
        const { error } = await supabase.from("schools").insert({ name: schoolName.trim() })

        if (error) throw error

        setSuccess(`School "${schoolName}" added successfully`)
      }

      // Refresh schools list
      await fetchSchools()

      // Close dialog
      setIsDialogOpen(false)
    } catch (err: any) {
      setError(`Failed to save school: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schools</CardTitle>
            <CardDescription>Manage schools in the system</CardDescription>
          </div>
          <Button onClick={handleAddSchool} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add School
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>School Name</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.length > 0 ? (
                    schools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.id}</TableCell>
                        <TableCell>{school.name}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEditSchool(school)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                        No schools found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit School Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchool ? "Edit School" : "Add New School"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="school-name" className="text-sm font-medium">
                School Name
              </label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchool} disabled={!schoolName.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
