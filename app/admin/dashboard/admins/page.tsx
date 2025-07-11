"use client"

import { useManageAdmins } from "@/hooks/useManageAdmins"
import { AdminsTable } from "@/components/admin/admins/AdminsTable"
import { AddAdminDialog } from "@/components/admin/admins/AddAdminDialog"
import { EditAdminDialog } from "@/components/admin/admins/EditAdminDialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"
import BackToDashboard from "@/components/admin/BackToDashboard"
import LoadingPage from "@/components/admin/LoadingPage"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdminUser } from "@/hooks/useAdminUser"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function ManageAdminsPage() {
  const {
    admins,
    loading,
    error,
    openAddDialog,
    setOpenAddDialog,
    handleAddAdmin,
    handleRemoveAdmin,
    handleToggleSuperAdmin,
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
  } = useManageAdmins()
  useAdminUser();
  const [pendingDelete, setPendingDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Wrap handleRemoveAdmin to show confirmation dialog
  const handleRemoveAdminWithConfirm = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId)
    setPendingDelete(admin)
  }

  // Confirm delete handler
  const confirmDeleteAdmin = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    await handleRemoveAdmin(pendingDelete.id)
    setDeleting(false)
    setPendingDelete(null)
  }

  if (loading) return <LoadingPage message="Loading admins..." />

  return (
      <div className="max-w-6xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 sm:p-3 rounded-full mr-2 sm:mr-4 flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            Manage Admins
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            View, add, and manage admin users and their school access.
          </p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300 mb-8">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-white text-base sm:text-lg">Admins</CardTitle>
            <Button
              onClick={() => setOpenAddDialog(true)}
              size="sm"
              className="bg-white text-[#223152] hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add Admin
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <AdminsTable
              admins={admins}
              schools={schools}
              onRemove={handleRemoveAdminWithConfirm}
              onToggleSuperAdmin={handleToggleSuperAdmin}
              onEdit={handleEditAdmin}
            />
          </CardContent>
        </Card>
        <AddAdminDialog
          open={openAddDialog}
          setOpen={setOpenAddDialog}
          onAdd={handleAddAdmin}
          error={addDialogError}
          setError={setAddDialogError}
          schoolOptions={schoolOptions}
        />
        <EditAdminDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          admin={editAdmin}
          onSave={handleSaveEditAdmin}
          error={editDialogError}
          setError={setEditDialogError}
          schoolOptions={schoolOptions}
        />
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-gray-700">
                Are you sure you want to delete admin{" "}
                <span className="font-semibold">{pendingDelete?.full_name || pendingDelete?.email}</span>? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAdmin}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
