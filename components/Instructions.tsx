import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Instructions() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="min-w-0">
            <h3 className="font-semibold text-blue-900 mb-2">How to use this portal:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Enter the student ID in the search box above</li>
              <li>• View detailed results with color-coded grade levels</li>
              <li>• Export professional PDF reports with school branding</li>
              <li>• All reports include official signatures and formatting</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
