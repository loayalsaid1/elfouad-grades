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

  if (loading) return <LoadingPage message="Loading admins..." />

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-3 rounded-full mr-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            Manage Admins
          </h1>
          <p className="text-gray-600 mt-2">
            View, add, and manage admin users and their school access.
          </p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300 mb-8">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
            <CardTitle className="text-white">Admins</CardTitle>
            <Button
              onClick={() => setOpenAddDialog(true)}
              size="sm"
              className="bg-white text-[#223152] hover:bg-gray-100 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Admin
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <AdminsTable
              admins={admins}
              schools={schools}
              onRemove={handleRemoveAdmin}
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
      </div>
    </div>
  )
}
