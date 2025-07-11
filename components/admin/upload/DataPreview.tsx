import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Loader2 } from "lucide-react"

interface ParsedStudent {
  student_id: string
  student_name: string
  parent_password: string | null
  scores: { subject: string; score: number | null; full_mark: number; absent: boolean }[]
}

interface DataPreviewProps {
  parsedData: string[][]
  processedStudents: ParsedStudent[]
  loading: boolean
  canSave: boolean
  isAbsentScore: (value: string) => boolean
  onClear: () => void
  onSave: () => void
}

export function DataPreview({ 
  parsedData, 
  processedStudents, 
  loading, 
  canSave, 
  isAbsentScore, 
  onClear, 
  onSave 
}: DataPreviewProps) {
  // Helper function to determine if a cell should be highlighted as absent (only for subject columns)
  const shouldHighlightAsAbsent = (rowIndex: number, cellIndex: number, cell: string): boolean => {
    if (rowIndex <= 1) return false // Don't highlight headers or full marks row

    const headers = parsedData?.[0] || []
    const header = headers[cellIndex]?.toLowerCase() || ""

    // Only highlight if it's a subject column (not id, name, or password)
    const nonSubjectColumns = ["id", "student_id", "student_name", "name", "parent_password", "password"]
    const isSubjectColumn = !nonSubjectColumns.some((col) => header.includes(col.toLowerCase()))

    return isSubjectColumn && isAbsentScore(cell)
  }

  return (
    <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-white flex items-center text-base sm:text-lg">
          <div className="bg-white/20 p-1 sm:p-2 rounded-full mr-2 sm:mr-3">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          Data Preview
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs sm:text-sm mt-1">
          Review the parsed data before saving to database. Absent students (in subject columns) are highlighted in red.
          {processedStudents.length > 0 && (
            <span className="ml-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                {processedStudents.length} students processed
              </Badge>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="overflow-x-auto -mx-3 sm:mx-0 border-2 rounded-lg shadow-inner">
          <table className="min-w-full border-collapse text-[10px] sm:text-xs">
            <tbody>
              {parsedData.slice(0, 10).map((row, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-200 ${
                    index === 0 
                      ? "bg-gradient-to-r from-blue-100 to-blue-200" 
                      : index === 1 
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200" 
                        : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {row.map((cell, cellIndex) => {
                    const isAbsentCell = shouldHighlightAsAbsent(index, cellIndex, cell)
                    return (
                      <td
                        key={cellIndex}
                        className={`border border-gray-200 px-1 py-1 sm:px-3 sm:py-2 transition-colors duration-200 ${
                          isAbsentCell ? "bg-red-100 text-red-700 font-semibold" : ""
                        } ${
                          index === 0 ? "font-semibold text-blue-800" : 
                          index === 1 ? "font-semibold text-yellow-800" : ""
                        }`}
                      >
                        {cell || (isAbsentCell ? "ABSENT" : "-")}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {parsedData.length > 10 && (
          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
            Showing first 10 rows of {parsedData.length} total rows
          </p>
        )}

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            onClick={onClear}
            className="border-gray-300 hover:bg-gray-50 transition-all duration-300 text-xs sm:text-sm h-8 sm:h-10"
          >
            Clear
          </Button>
          <Button 
            onClick={onSave} 
            disabled={loading || !canSave}
            className="bg-[#223152] hover:bg-[#1a2642] text-white min-w-[120px] sm:min-w-[150px] font-medium shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm h-8 sm:h-10"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Save to Database
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
