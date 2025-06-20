"use client"

import { useState, useEffect } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, School, AlertCircle, CheckCircle } from "lucide-react"
import { useAdminUser } from "@/hooks/useAdminUser"
import BackToDashboard from "@/components/admin/BackToDashboard"
import LoadingPage from "@/components/admin/LoadingPage"

export default function SchoolsPage() {
  const user = useAdminUser()
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<any | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [schoolSlug, setSchoolSlug] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClientComponentSupabaseClient()

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      setError("")

      const { data, error } = await supabase.from("schools").select("*").order("name")

      if (error) throw error

      setSchools(data || [])
    } catch (err: any) {
      setError("Failed to load schools: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchool = () => {
    setEditingSchool(null)
    setSchoolName("")
    setSchoolSlug("")
    setIsDialogOpen(true)
  }

  const handleEditSchool = (school: any) => {
    setEditingSchool(school)
    setSchoolName(school.name)
    setSchoolSlug(school.slug || "")
    setIsDialogOpen(true)
  }

  const handleSaveSchool = async () => {
    if (!schoolName.trim() || !schoolSlug.trim()) return

    try {
      setIsSaving(true)
      setError("")

      if (editingSchool) {
        // Update existing school
        const { error } = await supabase
          .from("schools")
          .update({ name: schoolName.trim(), slug: schoolSlug.trim() })
          .eq("id", editingSchool.id)

        if (error) throw error
        setMessage(`School "${schoolName}" updated successfully`)
      } else {
        // Add new school
        const { error } = await supabase
          .from("schools")
          .insert({ name: schoolName.trim(), slug: schoolSlug.trim() })

        if (error) throw error
        setMessage(`School "${schoolName}" added successfully`)
      }

      // Refresh schools list
      await fetchSchools()
      setIsDialogOpen(false)
    } catch (err: any) {
      setError("Failed to save school: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!user) {
    return <LoadingPage message="Loading schools..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <School className="mr-3" />
            Schools Management
          </h1>
          <p className="text-gray-600 mt-2">Manage schools in the system</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Schools</CardTitle>
              <CardDescription>Add and manage schools in the system</CardDescription>
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
              <div className="space-y-4">
                {schools.length > 0 ? (
                  schools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-sm text-gray-500">ID: {school.id}</p>
                        <p className="text-xs text-gray-400">Slug: {school.slug || <span className="italic text-gray-300">none</span>}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditSchool(school)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No schools found</p>
                    <p className="text-sm">Add your first school to get started</p>
                  </div>
                )}
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
              <div className="space-y-2">
                <label htmlFor="school-slug" className="text-sm font-medium">
                  Slug
                </label>
                <Input
                  id="school-slug"
                  value={schoolSlug}
                  onChange={(e) => setSchoolSlug(e.target.value)}
                  placeholder="Enter school slug (e.g. el-fouad-primary)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchool} disabled={!schoolName.trim() || !schoolSlug.trim() || isSaving}>
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
    </div>
  )
}
