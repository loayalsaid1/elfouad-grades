"use client"

import { useState } from "react"
import { ContextSelector } from "@/components/admin/context-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { BackupAndExportDiff } from "@/components/admin/diff/BackupAndExportDiff"
import BackToDashboard from "@/components/admin/BackToDashboard"

export default function DiffsPage() {
  const [context, setContext] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#223152] flex items-center">
            <div className="bg-[#223152] p-3 rounded-full mr-4">
              <Info className="h-8 w-8 text-white" />
            </div>
            Compare Uploaded Backup with Current Database Records
          </h1>
          <p className="text-gray-600 mt-2">
            Select a context to compare the uploaded backup file (CSV) with the current database records. 
            View differences in student results, including additions, removals, and updates.
          </p>
        </div>
        <div className="mb-6">
          <ContextSelector onContextChange={setContext} />
        </div>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="font-medium text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {context && (
          <BackupAndExportDiff context={context} onError={setError} />
        )}
      </div>
    </div>
  )
}
