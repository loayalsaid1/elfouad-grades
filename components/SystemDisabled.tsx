import { AlertTriangle, RefreshCw, Phone, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SystemDisabled() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="max-w-2xl w-full shadow-xl border-2 border-orange-200 animate-in fade-in-50 duration-500">
        <CardContent className="p-4 sm:p-8 text-center">
          <div className="bg-orange-100 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-orange-600" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#223152] mb-3 sm:mb-4">
            System Under Maintenance
          </h1>
          
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              The student results portal is temporarily unavailable for maintenance. 
              We're working to improve your experience and will be back online soon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-1 sm:mb-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#223152] mr-2" />
                <span className="font-semibold text-[#223152] text-sm sm:text-base">Contact School</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                For urgent inquiries, please contact your school directly
              </p>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-1 sm:mb-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#223152] mr-2" />
                <span className="font-semibold text-[#223152] text-sm sm:text-base">Check Back Later</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                The system will be restored as soon as possible
              </p>
            </div>
          </div>

          <Button 
            onClick={handleRefresh}
            className="bg-[#223152] hover:bg-[#1a2642] text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-medium shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Refresh Page
          </Button>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Thank you for your patience
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
