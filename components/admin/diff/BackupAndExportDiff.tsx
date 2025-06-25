import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Papa from "papaparse"
import { getContextBackupCSV, getContextExportCSV, diffStudentCSVs } from "@/lib/diffUtils"
import DiffTable from "./DiffTable"

export function BackupAndExportDiff({ context, onError }: { context: any, onError: (msg: string|null) => void }) {
  const [backupCSV, setBackupCSV] = useState<string | null>(null)
  const [exportCSV, setExportCSV] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [diffRows, setDiffRows] = useState<any[]>([])
  const [parsedBackup, setParsedBackup] = useState<any[]>([])
  const [parsedExport, setParsedExport] = useState<any[]>([])

  // Fetch backup and export CSVs
  useEffect(() => {
    if (!context) return
    setLoading(true)
    setBackupCSV(null)
    setExportCSV(null)
    setDiffRows([])
    setParsedBackup([])
    setParsedExport([])
    onError(null)
    Promise.all([
      getContextBackupCSV(context).catch(() => null),
      getContextExportCSV(context).catch(() => null),
    ])
      .then(([backup, exported]) => {
        setBackupCSV(backup)
        setExportCSV(exported)
        if (!backup && !exported) {
          onError("No backup or export file found for this context.")
        }
      })
      .catch((err) => {
        onError("Failed to fetch files: " + err.message)
      })
      .finally(() => setLoading(false))
  }, [context, onError])

  // Parse CSVs
  useEffect(() => {
    if (backupCSV) {
      const parsed = Papa.parse(backupCSV, { skipEmptyLines: true }).data as string[][]
      setParsedBackup(parsed)
    }
    if (exportCSV) {
      const parsed = Papa.parse(exportCSV, { skipEmptyLines: true }).data as string[][]
      setParsedExport(parsed)
    }
  }, [backupCSV, exportCSV])

  // Compute diff
  useEffect(() => {
    if (parsedBackup.length > 0 && parsedExport.length > 0) {
      // Only diff if both are present
			const diff = diffStudentCSVs(parsedBackup, parsedExport)
			setDiffRows(diff)
    }
  }, [parsedBackup, parsedExport])

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Button
          variant="outline"
          disabled={!backupCSV}
          onClick={() => {
            if (backupCSV) {
              const blob = new Blob([backupCSV], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "backup.csv"
              a.click()
              URL.revokeObjectURL(url)
            }
          }}
        >
          Download Backup CSV
        </Button>
        <Button
          variant="outline"
          disabled={!exportCSV}
          onClick={() => {
            if (exportCSV) {
              const blob = new Blob([exportCSV], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "export.csv"
              a.click()
              URL.revokeObjectURL(url)
            }
          }}
        >
          Download Exported CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Backup File</h3>
          <pre className="overflow-x-auto bg-gray-100 p-2 rounded text-xs max-h-64">{backupCSV || "No backup file found."}</pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Exported File</h3>
          <pre className="overflow-x-auto bg-gray-100 p-2 rounded text-xs max-h-64">{exportCSV || "No exported file found."}</pre>
        </div>
      </div>
      {diffRows.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Diff Table</h3>
          <DiffTable diffRows={diffRows} />
        </div>
      )}
      {!loading && diffRows.length === 0 && backupCSV && exportCSV && (
        <div className="text-green-700 font-medium">No differences found between backup and exported files.</div>
      )}
    </div>
  )
}
