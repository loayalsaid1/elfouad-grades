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
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
          <div>
            <CardTitle className="text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <School className="h-5 w-5" />
              </div>
              Schools Management
            </CardTitle>
            <CardDescription className="text-blue-100">Manage schools in the system</CardDescription>
          </div>
          <Button 
            onClick={handleAddSchool} 
            size="sm"
            className="bg-white text-[#223152] hover:bg-gray-100 transition-all duration-300 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add School
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#223152] mr-3" />
              <span className="text-[#223152] font-medium">Loading schools...</span>
            </div>
          ) : (
            <div className="border-2 rounded-lg overflow-hidden shadow-inner">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-2">
                    <TableHead className="font-semibold text-[#223152]">ID</TableHead>
                    <TableHead className="font-semibold text-[#223152]">School Name</TableHead>
                    <TableHead className="w-[100px] font-semibold text-[#223152]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.length > 0 ? (
                    schools.map((school, index) => (
                      <TableRow key={school.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <TableCell className="font-medium text-[#223152]">{school.id}</TableCell>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditSchool(school)}
                            className="hover:bg-[#223152] hover:text-white transition-all duration-300"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <div className="flex flex-col items-center text-gray-500">
                          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                            <School className="h-10 w-10 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">No schools found</p>
                          <p className="text-sm">Add your first school to get started</p>
                        </div>
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
        <DialogContent className="sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#223152] text-xl">{editingSchool ? "Edit School" : "Add New School"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="school-name" className="text-sm font-medium text-[#223152]">
                School Name
              </label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name"
                className="focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={isSaving}
              className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSchool} 
              disabled={!schoolName.trim() || isSaving}
              className="bg-[#223152] hover:bg-[#1a2642] text-white transition-all duration-300"
            >
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
