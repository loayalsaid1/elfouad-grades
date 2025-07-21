import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface ContextErrorProps {
  error: string
  schoolSlug: string
  grade: string
  onBack: () => void
}

export function ContextError({ error, schoolSlug, grade, onBack }: ContextErrorProps) {
  return (
    <div className="container h-full mx-auto px-4 py-8">
      <Button variant="outline" onClick={onBack} className="mb-8 hover:bg-[#223152] hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Grades
      </Button>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Academic Context Error:</strong> {error}
          <br />
          <span className="text-sm mt-2 block">
            Please ensure that an active academic context is set up for {schoolSlug} grade {grade} in the admin dashboard.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  )
}
