import { Switch } from "@/components/ui/switch"
import type { AcademicContext } from "@/hooks/useSettingsPage"

interface AcademicContextRowProps {
  context: AcademicContext
  isActive: boolean
  onToggle: (checked: boolean) => void
  onDelete: () => void // Add this prop
}

export function AcademicContextRow({
  context,
  isActive,
  onToggle,
  onDelete,
}: AcademicContextRowProps) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-900">{context.schools?.name || "Unknown School"}</span>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
            {context.year}-{context.year + 1}
          </span>
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
            Grade {context.grade}
          </span>
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
            {context.term === 1 ? "First" : "Second"} Term
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
        />
        <button
          onClick={onDelete}
          className="ml-2 text-red-600 hover:underline text-xs"
          title="Delete context"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
