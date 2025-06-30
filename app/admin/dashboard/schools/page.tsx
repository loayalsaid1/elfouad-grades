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
  const [schoolDescription, setSchoolDescription] = useState("")
  const [schoolLogo, setSchoolLogo] = useState<File | null>(null)
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
    setSchoolDescription("")
    setSchoolLogo(null)
    setIsDialogOpen(true)
  }

  const handleEditSchool = (school: any) => {
    setEditingSchool(school)
    setSchoolName(school.name)
    setSchoolSlug(school.slug || "")
    setSchoolDescription(school.description || "")
    setSchoolLogo(null)
    setIsDialogOpen(true)
  }

  const handleSaveSchool = async () => {
    if (!schoolName.trim() || !schoolSlug.trim()) return

    try {
      setIsSaving(true)
      setError("")

      let logoPath = null
      if (schoolLogo) {
        const filePath = `${schoolSlug}/elfouad-${schoolSlug}-logo`
        const { error: uploadError } = await supabase.storage
          .from("schools-logos")
          .upload(filePath, schoolLogo, {
            upsert: true,
          })
        if (uploadError) throw uploadError

        // Log the file path for debugging
        console.log("Uploaded file path:", filePath)

        logoPath = filePath
      }

      if (editingSchool) {
        // Update existing school
        const { error } = await supabase
          .from("schools")
          .update({
            name: schoolName.trim(),
            slug: schoolSlug.trim(),
            description: schoolDescription.trim(),
            logo: logoPath || editingSchool.logo,
          })
          .eq("id", editingSchool.id)

        if (error) throw error
        setMessage(`School "${schoolName}" updated successfully`)
      } else {
        // Add new school
        const { error } = await supabase
          .from("schools")
          .insert({
            name: schoolName.trim(),
            slug: schoolSlug.trim(),
            description: schoolDescription.trim(),
            logo: logoPath,
          })

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
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-3 rounded-full mr-4">
              <School className="h-8 w-8 text-white" />
            </div>
            Schools Management
          </h1>
          <p className="text-gray-600 mt-2">Manage schools in the system</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
            <div>
              <CardTitle className="text-white">Schools</CardTitle>
              <CardDescription className="text-blue-100">Add and manage schools in the system</CardDescription>
            </div>
            <Button 
              onClick={handleAddSchool} 
              size="sm"
              className="bg-white text-[#223152] hover:bg-gray-100 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add School
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#223152]" />
              </div>
            ) : (
              <div className="space-y-4">
                {schools.length > 0 ? (
                  schools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-6 border-2 rounded-lg hover:border-[#223152] hover:shadow-lg transition-all duration-300 bg-white">
                      <div>
                        <h3 className="font-medium text-[#223152] text-lg">{school.name}</h3>
                        <p className="text-sm text-gray-500">ID: {school.id}</p>
                        <p className="text-xs text-gray-400">Slug: {school.slug || <span className="italic text-gray-300">none</span>}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditSchool(school)}
                        className="border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white transition-all duration-300"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <School className="h-12 w-12 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">No schools found</p>
                    <p className="text-sm">Add your first school to get started</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit School Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#223152]">{editingSchool ? "Edit School" : "Add New School"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="school-name" className="text-sm font-medium text-gray-700">
                  School Name
                </label>
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                  className="focus:border-[#223152] focus:ring-[#223152]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="school-slug" className="text-sm font-medium text-gray-700">
                  Slug
                </label>
                <Input
                  id="school-slug"
                  value={schoolSlug}
                  onChange={(e) => setSchoolSlug(e.target.value)}
                  placeholder="Enter school slug (e.g. el-fouad-primary)"
                  className="focus:border-[#223152] focus:ring-[#223152]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="school-description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="school-description"
                  value={schoolDescription}
                  onChange={(e) => setSchoolDescription(e.target.value)}
                  placeholder="Enter school description"
                  className="w-full border rounded px-3 py-2 focus:border-[#223152] focus:ring-[#223152]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="school-logo" className="text-sm font-medium text-gray-700">
                  Logo
                </label>
                <input
                  id="school-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSchoolLogo(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSchool}
                disabled={!schoolName.trim() || !schoolSlug.trim() || isSaving}
                className="bg-[#223152] hover:bg-[#1a2642] text-white"
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
    </div>
  )
}
