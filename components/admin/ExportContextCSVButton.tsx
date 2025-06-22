import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useContextStudentsExport } from "@/hooks/useContextStudentsExport"

export default function ExportContextCSVButton({ context }: { context: { id: number, year: number, term: number, grade: number, school_id: number, school_slug?: string } }) {
  const { exportContextCSV, loading } = useContextStudentsExport()
  console.log(context)

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={() => exportContextCSV(context)}
      disabled={loading}
    >
      <Download className="w-4 h-4 mr-1" />
      {loading ? "Exporting..." : "Export All to CSV"}
    </Button>
  )
}
