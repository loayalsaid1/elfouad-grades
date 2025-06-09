import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CSVUploader } from "@/components/upload/csv-uploader"

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Student Results</h1>
          <p className="text-gray-600">Upload CSV files containing student results for processing</p>
        </div>

        <CSVUploader />
      </div>
    </DashboardLayout>
  )
}
