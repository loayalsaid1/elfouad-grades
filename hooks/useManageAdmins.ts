import { useEffect, useState } from "react"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { useAdminUser } from "@/hooks/useAdminUser"

export function useManageAdmins() {
  const supabase = createClientComponentSupabaseClient()
  const { profile } = useAdminUser()
  const [admins, setAdmins] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [schoolOptions, setSchoolOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [addDialogError, setAddDialogError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState<any | null>(null)
  const [editDialogError, setEditDialogError] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use the view to get admins with email and school_ids
      const { data: adminsData, error: adminsError } = await supabase
        .from("admins_with_email")
        .select("*")
      if (adminsError) throw adminsError
      setAdmins(adminsData || [])

      // Fetch all schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select("id, name")
        .order("name")
      if (schoolsError) throw schoolsError
      setSchools(schoolsData || [])
      setSchoolOptions((schoolsData || []).map((s: any) => ({ value: s.id, label: s.name })))
    } catch (err: any) {
      setError("Failed to load admins: " + (err.message || err.toString()))
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (admin: { email: string; full_name: string; is_super_admin: boolean; school_ids: number[] }) => {
    setAddDialogError(null)
    try {
      // Always send is_super_admin: false
      const res = await fetch("/api/admin/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...admin, is_super_admin: false }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to add admin")
      await fetchAll()
      setOpenAddDialog(false)
    } catch (err: any) {
      setAddDialogError(err.message || "Failed to add admin")
    }
  }

  const handleEditAdmin = (admin: any) => {
    setEditAdmin(admin)
    setEditDialogError(null)
    setEditDialogOpen(true)
  }

  const handleSaveEditAdmin = async (admin: { id: string; full_name: string; is_super_admin: boolean; school_ids: number[] }) => {
    setEditDialogError(null)
    try {
      // Always set is_super_admin: false
      await supabase.from("users").update({
        full_name: admin.full_name,
        is_super_admin: false,
      }).eq("id", admin.id)

      await supabase.from("user_school_access").delete().eq("user_id", admin.id)
      if (admin.school_ids.length > 0) {
        const accessRows = admin.school_ids.map((school_id) => ({
          user_id: admin.id,
          school_id,
        }))
        await supabase.from("user_school_access").insert(accessRows)
      }
      await fetchAll()
      setEditDialogOpen(false)
    } catch (err: any) {
      setEditDialogError(err.message || "Failed to update admin")
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    if (!profile?.is_super_admin) {
      setError("Only super admins can remove admins.")
      return
    }
    try {
      // Call the new API route to delete the admin from auth.users
      const res = await fetch("/api/admin/delete-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to remove admin")
      await fetchAll()
    } catch (err: any) {
      setError("Failed to remove admin: " + (err.message || err.toString()))
    }
  }

  return {
    admins,
    loading,
    error,
    openAddDialog,
    setOpenAddDialog,
    handleAddAdmin,
    handleRemoveAdmin,
    addDialogError,
    setAddDialogError,
    schools,
    schoolOptions,
    // Edit dialog
    editDialogOpen,
    setEditDialogOpen,
    editAdmin,
    setEditAdmin,
    handleEditAdmin,
    handleSaveEditAdmin,
    editDialogError,
    setEditDialogError,
  }
}