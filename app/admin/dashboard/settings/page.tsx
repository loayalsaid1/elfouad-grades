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
  const {user, profile } = useAdminUser()
  const settings = useSettingsPage()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)
  const [changes, setChanges] = useState<{ id: string; name: string; from: boolean; to: boolean }[]>([])

  const {
    getChanges,
    resetInitial,
  } = useActiveContextChanges(settings.contexts, settings.activeContexts, settings.loading)

  // Auto-scroll to top when error or success message appears
  useEffect(() => {
    if (settings.error || settings.message) {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    }
  }, [settings.error, settings.message])

  if (settings.loading || !user) {
    return <LoadingPage message="Loading settings..." />
  }

  const isSuperAdmin = profile?.is_super_admin || false

  const handleSave = () => {
    const diff = getChanges()
    setChanges(diff)
    if (diff.length > 0) {
      setShowConfirm(true)
    } else {
      settings.handleSaveSettings(isSuperAdmin)
    }
  }

  const handleConfirm = async () => {
    setPendingSave(true)
    await settings.handleSaveSettings(isSuperAdmin)
    setShowConfirm(false)
    setPendingSave(false)
    resetInitial()
  }

  return (
      <div className="max-w-6xl mx-auto px-4">
        <BackToDashboard />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 sm:p-3 rounded-full mr-2 sm:mr-4 flex-shrink-0">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            System Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage system availability and active academic contexts
          </p>
        </div>
        
        <AlertMessage error={settings.error} message={settings.message} />
        { isSuperAdmin && (
          <SystemAvailabilityCard
            systemEnabled={settings.systemEnabled}
            setSystemEnabled={settings.setSystemEnabled}
          />          
        )}
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
  )
}
