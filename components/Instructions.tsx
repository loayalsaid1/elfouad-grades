import { FileText, Search, Download, Shield, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Instructions() {
  return (
    <div className="space-y-6">
      {/* Main Instructions */}
      <Card className="shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
          <CardTitle className="text-white flex items-center">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            How to Use This Portal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
              <div className="bg-blue-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#223152] mb-2">1. Search</h3>
              <p className="text-sm text-gray-600">
                Enter your National ID in the search field above to find your results
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
              <div className="bg-green-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#223152] mb-2">2. View Results</h3>
              <p className="text-sm text-gray-600">
                Browse your academic results with color-coded performance indicators
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-300">
              <div className="bg-purple-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#223152] mb-2">3. Download</h3>
              <p className="text-sm text-gray-600">
                Export professional PDF reports with official school branding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
