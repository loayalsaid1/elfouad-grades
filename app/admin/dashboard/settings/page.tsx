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

export default function SettingsPage() {
  const user = useAdminUser()
  const settings = useSettingsPage()

  if (settings.loading || !user) {
    return <LoadingPage message="Loading settings..." />
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
        />
        <div className="flex justify-end">
          <SaveSettingsButton
            saving={settings.saving}
            onSave={settings.handleSaveSettings}
          />
        </div>
      </div>
    </div>
  )
}
