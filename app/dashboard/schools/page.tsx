import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SchoolsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schools & Contexts</h1>
          <p className="text-gray-600">Manage schools and academic contexts</p>
        </div>

        <div className="bg-white p-8 rounded-lg border shadow-sm text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">School and context management features will be available in the next update.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
