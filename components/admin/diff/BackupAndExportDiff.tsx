import { Button } from "@/components/ui/button"
import { useDiffCSVs } from "@/hooks/useDiffCSVs"
import DiffTable from "./DiffTable"
import { CSVTable } from "./CSVTable"

export function BackupAndExportDiff({ context, onError }: { context: any, onError: (msg: string|null) => void }) {
  const {
    backupCSV, exportCSV, loading, diffRows, parsedBackup, parsedExport,
    downloadBackup, downloadExport, error: diffError
  } = useDiffCSVs(context, onError)

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Button variant="outline" disabled={!backupCSV} onClick={downloadBackup}>
          Download Backup CSV
        </Button>
        <Button variant="outline" disabled={!exportCSV} onClick={downloadExport}>
          Download Exported CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Backup File</h3>
          <div className="overflow-x-auto max-w-full max-h-64 border rounded bg-gray-50">
            <CSVTable data={parsedBackup} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Exported File</h3>
          <div className="overflow-x-auto max-w-full max-h-64 border rounded bg-gray-50">
            <CSVTable data={parsedExport} />
          </div>
        </div>
      </div>
      {diffRows.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Diff Table</h3>
          <div className="overflow-x-auto max-w-full max-h-96 border rounded bg-white">
            <DiffTable diffRows={diffRows} />
          </div>
        </div>
      )}
      {!loading && diffRows.length === 0 && backupCSV && exportCSV && (
        <div className="text-green-700 font-medium">No differences found between backup and exported files.</div>
      )}
      {diffError && (
        <div className="text-red-700 font-medium mt-4">{diffError}</div>
      )}
    </div>
  )
}
