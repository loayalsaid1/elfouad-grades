import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ValidationErrorsProps {
  errors: string[]
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null

  return (
    <Card className="mb-6 border-2 border-red-200 shadow-xl animate-in slide-in-from-top-2 duration-300">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          Validation Errors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-red-50">
        <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
          {errors.map((error, index) => (
            <li key={index} className="font-medium">{error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
