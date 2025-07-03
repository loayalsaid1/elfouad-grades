import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export function AddAdminDialog({
  open,
  setOpen,
  onAdd,
  error,
  setError,
  schoolOptions,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onAdd: (admin: { email: string; full_name: string; is_super_admin: boolean; school_ids: number[] }) => void
  error: string | null
  setError: (e: string | null) => void
  schoolOptions: { value: number; label: string }[]
}) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [selectedSchools, setSelectedSchools] = useState<number[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !fullName) {
      setError("Email and full name are required")
      return
    }
    if (!isSuperAdmin && selectedSchools.length === 0) {
      setError("Select at least one school for school admin")
      return
    }
    onAdd({
      email,
      full_name: fullName,
      is_super_admin: isSuperAdmin,
      school_ids: selectedSchools,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#223152]">Add New Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
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
          <div className="flex items-center gap-2">
            <input
              id="super-admin"
              type="checkbox"
              checked={isSuperAdmin}
              onChange={e => setIsSuperAdmin(e.target.checked)}
            />
            <label htmlFor="super-admin" className="text-sm font-medium text-gray-700">
              Super Admin (access to all schools)
            </label>
          </div>
          {!isSuperAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">School Access</label>
              <div className="flex flex-wrap gap-2">
                {schoolOptions.map((school) => (
                  <label key={school.value} className="flex items-center gap-1 text-xs border rounded px-2 py-1">
                    <input
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
          )}
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
              Add Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
