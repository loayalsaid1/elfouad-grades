import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EditAdminDialog({
  open,
  setOpen,
  admin,
  onSave,
  error,
  setError,
  schoolOptions,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  admin: any
  onSave: (admin: { id: string; full_name: string; school_ids: number[] }) => void
  error: string | null
  setError: (e: string | null) => void
  schoolOptions: { value: number; label: string }[]
}) {
  const [fullName, setFullName] = useState("")
  const [selectedSchools, setSelectedSchools] = useState<number[]>([])

  useEffect(() => {
    if (admin) {
      setFullName(admin.full_name || "")
      setSelectedSchools(admin.school_ids || [])
    }
  }, [admin])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fullName) {
      setError("Full name is required")
      return
    }
    if (selectedSchools.length === 0) {
      setError("Select at least one school for school admin")
      return
    }
    onSave({
      id: admin.id,
      full_name: fullName,
      school_ids: selectedSchools,
    })
  }

  if (!admin) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#223152]">Edit Admin Permissions</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label htmlFor="admin-fullname" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="admin-fullname"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">School Access</label>
            <div className="flex flex-wrap gap-2">
              {schoolOptions.map((school) => (
                <label key={school.value} className="flex items-center gap-1 text-xs border rounded px-2 py-1">
                  <input
                    disabled={admin.is_super_admin}
                    type="checkbox"
                    checked={selectedSchools.includes(school.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedSchools(prev => [...prev, school.value])
                      } else {
                        setSelectedSchools(prev => prev.filter(id => id !== school.value))
                      }
                    }}
                  />
                  {school.label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#223152] hover:bg-[#1a2642] text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}