import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SystemSettings } from "@/components/settings/system-settings"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Manage system configuration and availability</p>
        </div>

        <SystemSettings />
      </div>
    </DashboardLayout>
  )
}
