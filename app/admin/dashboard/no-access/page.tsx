"use client"

import { AlertTriangle, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAdminUser } from "@/hooks/useAdminUser"

export default function NoAccessPage() {
  const router = useRouter()
  useAdminUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-2xl border-2 border-orange-200 animate-in fade-in-50 duration-500">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#223152] text-center">
            No School Access
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              You do not have access to any schools in the system.<br />
              Please contact your system administrator to request access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-[#223152] mr-2" />
                <span className="font-semibold text-[#223152]">Contact Admin</span>
              </div>
              <p className="text-sm text-gray-600">
                Reach out to your administrator for access.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-[#223152] mr-2" />
                <span className="font-semibold text-[#223152]">Need Help?</span>
              </div>
              <p className="text-sm text-gray-600">
                If you believe this is a mistake, please email support.
              </p>
            </div>
          </div>
          <Button
            className="bg-[#223152] hover:bg-[#1a2642] text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
