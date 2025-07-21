import { Database } from "lucide-react"

interface ContextLoadingProps {
  message?: string
}

export function ContextLoading({ message = "Loading academic context..." }: ContextLoadingProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Database className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">{message}</p>
        </div>
      </div>
    </div>
  )
}
