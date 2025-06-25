import { useEffect, useState, useCallback } from "react"
import Papa from "papaparse"
import { getContextBackupCSV, getContextExportCSV, diffStudentCSVs } from "@/lib/diffUtils"

export function useDiffCSVs(context: any, onError: (msg: string|null) => void) {
  const [backupCSV, setBackupCSV] = useState<string | null>(null)
  const [exportCSV, setExportCSV] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [diffRows, setDiffRows] = useState<any[]>([])
  const [parsedBackup, setParsedBackup] = useState<string[][]>([])
  const [parsedExport, setParsedExport] = useState<string[][]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch backup and export CSVs
  useEffect(() => {
    if (!context) return
    setLoading(true)
    setBackupCSV(null)
    setExportCSV(null)
    setDiffRows([])
    setParsedBackup([])
    setParsedExport([])
    setError(null)
    onError(null)
    Promise.all([
      getContextBackupCSV(context).catch(() => null),
      getContextExportCSV(context).catch(() => null),
    ])
      .then(([backup, exported]) => {
        setBackupCSV(backup)
        setExportCSV(exported)
        if (!backup && !exported) {
          setError("No backup or export file found for this context.")
          onError("No backup or export file found for this context.")
        }
      })
      .catch((err) => {
        setError("Failed to fetch files: " + err.message)
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
      const diff = diffStudentCSVs(parsedBackup, parsedExport)
      setDiffRows(diff)
    }
  }, [parsedBackup, parsedExport])

  const downloadBackup = useCallback(() => {
    if (backupCSV) {
      const blob = new Blob([backupCSV], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "backup.csv"
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [backupCSV])

  const downloadExport = useCallback(() => {
    if (exportCSV) {
      const blob = new Blob([exportCSV], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "export.csv"
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [exportCSV])

  return {
    backupCSV,
    exportCSV,
    loading,
    diffRows,
    parsedBackup,
    parsedExport,
    downloadBackup,
    downloadExport,
    error,
  }
}
