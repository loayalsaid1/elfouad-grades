import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useEffect, useRef } from "react"

interface AlertMessageProps {
  error?: string
  message?: string
}

export function AlertMessage({ error, message }: AlertMessageProps) {
  const alertRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to alert when it appears
  useEffect(() => {
    if ((error || message) && alertRef.current) {
      alertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, [error, message])

  if (!error && !message) return null
  
  return (
    <div ref={alertRef}>
      {error && (
        <Alert variant="destructive" className="mb-6 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="mb-6 bg-green-50 border-green-200 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
