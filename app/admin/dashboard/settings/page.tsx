"use client"

import { useAdminUser } from "@/hooks/useAdminUser"
import BackToDashboard from "@/components/admin/BackToDashboard"
import LoadingPage from "@/components/admin/LoadingPage"
import { Settings } from "lucide-react"
import { AlertMessage } from "@/components/admin/settings/AlertMessage"
import { SystemAvailabilityCard } from "@/components/admin/settings/SystemAvailabilityCard"
import { AcademicContextsCard } from "@/components/admin/settings/AcademicContextsCard"
import { SaveSettingsButton } from "@/components/admin/settings/SaveSettingsButton"
import { useSettingsPage } from "@/hooks/useSettingsPage"
import { useEffect, useState } from "react"
import { ActiveContextsConfirmDialog } from "@/components/admin/settings/ActiveContextsConfirmDialog"
import { useActiveContextChanges } from "@/hooks/useActiveContextChanges"

export default function SettingsPage() {
  const user = useAdminUser()
  const settings = useSettingsPage()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)
  const [changes, setChanges] = useState<{ id: string; name: string; from: boolean; to: boolean }[]>([])

  const {
    getChanges,
    resetInitial,
  } = useActiveContextChanges(settings.contexts, settings.activeContexts, settings.loading)

  if (settings.loading || !user) {
    return <LoadingPage message="Loading settings..." />
  }

  const handleSave = () => {
    const diff = getChanges()
    setChanges(diff)
    if (diff.length > 0) {
      setShowConfirm(true)
    } else {
      settings.handleSaveSettings()
    }
  }

  const handleConfirm = async () => {
    setPendingSave(true)
    await settings.handleSaveSettings()
    setShowConfirm(false)
    setPendingSave(false)
    resetInitial()
  }

  return (
    <div className="h-full bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage system availability and active academic contexts</p>
        </div>
        <AlertMessage error={settings.error} message={settings.message} />
        <SystemAvailabilityCard
          systemEnabled={settings.systemEnabled}
          setSystemEnabled={settings.setSystemEnabled}
        />
        <AcademicContextsCard
          contexts={settings.contexts}
          activeContexts={settings.activeContexts}
          setActiveContexts={settings.setActiveContexts}
          filters={settings.filters}
          setFilters={settings.setFilters}
          deleteContext={settings.deleteContext}
        />
        <div className="flex justify-end">
          <SaveSettingsButton
            saving={settings.saving}
            onSave={handleSave}
          />
        </div>
        {/* Confirmation Modal */}
        <ActiveContextsConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          changes={changes}
          pendingSave={pendingSave}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  )
}
