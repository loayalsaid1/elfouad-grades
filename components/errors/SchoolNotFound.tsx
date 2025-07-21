import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowLeft } from "lucide-react"

interface SchoolNotFoundProps {
  schoolSlug: string
  grade?: string
  error?: string
  onBack: () => void
  onRetry: () => void
}

export function SchoolNotFound({ schoolSlug, grade, error, onBack, onRetry }: SchoolNotFoundProps) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={onBack} className="mb-8 hover:bg-[#223152] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Schools
        </Button>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || (grade 
                ? `We couldn't find the school "${schoolSlug}" for grade ${grade}.`
                : `We couldn't find a school with the identifier "${schoolSlug}".`
              )} Please check the URL or contact support if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onBack}
                className="bg-[#223152] hover:bg-[#1a2642] text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Schools
              </Button>
              <Button 
                variant="outline"
                onClick={onRetry}
                className="hover:bg-gray-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
