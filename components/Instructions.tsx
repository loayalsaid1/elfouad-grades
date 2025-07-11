import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Instructions() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-0 sm:mt-1" />
          <div className="min-w-0">
            <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-base sm:text-lg">How to use this portal:</h3>
            <ul className="text-blue-800 space-y-1 text-xs sm:text-sm pl-4">
              <li>• Enter the student's national ID in the search box above</li>
              <li>• View detailed results with color-coded grade levels</li>
              <li>• Export professional PDF reports with school branding</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
