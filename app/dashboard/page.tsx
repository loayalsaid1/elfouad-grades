import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the El Fouad Schools Group admin portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Total Schools</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">2</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Active Contexts</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">16</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Student Records</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">Active</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/dashboard/upload" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium">Upload Results</h4>
              <p className="text-sm text-gray-600">Upload CSV files with student results</p>
            </a>
            <a href="/dashboard/schools" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium">Manage Schools</h4>
              <p className="text-sm text-gray-600">Add or edit school information</p>
            </a>
            <a href="/dashboard/settings" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-medium">System Settings</h4>
              <p className="text-sm text-gray-600">Configure system preferences</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
