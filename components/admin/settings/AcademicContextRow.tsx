import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AcademicContext } from "@/hooks/useSettingsPage"
import { Trash2, School, Calendar, GraduationCap, Clock } from "lucide-react"

interface AcademicContextRowProps {
  context: AcademicContext
  isActive: boolean
  onToggle: (checked: boolean) => void
  onDelete: () => void
}

export function AcademicContextRow({
  context,
  isActive,
  onToggle,
  onDelete,
}: AcademicContextRowProps) {
  return (
    <div
      className={`p-4 sm:p-6 border-2 rounded-lg transition-all duration-300 hover:shadow-lg \
      ${isActive 
        ? "bg-green-50 border-green-200 hover:border-green-300" 
        : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 sm:mb-3 gap-2 sm:gap-0">
            <div className="flex items-center space-x-2">
              <School className="h-4 w-4 text-[#223152]" />
              <span className="font-semibold text-[#223152] text-base sm:text-lg truncate">
                {context.schools?.name || "Unknown School"}
              </span>
            </div>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={`${
                isActive 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-gray-400 hover:bg-gray-500"
              } text-white transition-all duration-200 text-xs sm:text-sm`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center space-x-2 bg-white px-2 sm:px-3 py-1 rounded-lg border">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-800">
                {context.year}-{context.year + 1}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 sm:px-3 py-1 rounded-lg border">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-800">
                Grade {context.grade}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 sm:px-3 py-1 rounded-lg border">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs sm:text-sm font-medium text-yellow-800">
                {context.term === 1 ? "First" : "Second"} Term
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-w-[120px] sm:min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex items-center space-x-2 justify-between sm:justify-start">
            <Switch
              checked={isActive}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-[#223152] scale-110"
            />
            <span className="text-xs sm:text-sm font-medium text-[#223152]">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
