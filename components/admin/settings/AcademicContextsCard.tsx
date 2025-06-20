import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AcademicContextRow } from "./AcademicContextRow"
import type { AcademicContext, SettingsPageFilters } from "@/hooks/useSettingsPage"

interface AcademicContextsCardProps {
  contexts: AcademicContext[]
  activeContexts: Record<string, boolean>
  setActiveContexts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  filters: SettingsPageFilters
  setFilters: React.Dispatch<React.SetStateAction<SettingsPageFilters>>
}

function getOptions(contexts: AcademicContext[]) {
  const schoolOptions = Array.from(new Set(contexts.map((c) => c.schools?.name).filter(Boolean)))
  const yearOptions = Array.from(new Set(contexts.map((c) => c.year))).sort((a, b) => b - a)
  const gradeOptions = Array.from(new Set(contexts.map((c) => c.grade))).sort((a, b) => a - b)
  const termOptions = Array.from(new Set(contexts.map((c) => c.term))).sort()
  return { schoolOptions, yearOptions, gradeOptions, termOptions }
}

export function AcademicContextsCard({
  contexts,
  activeContexts,
  setActiveContexts,
  filters,
  setFilters,
}: AcademicContextsCardProps) {
  const { schoolOptions, yearOptions, gradeOptions, termOptions } = getOptions(contexts)

  const filteredContexts = contexts.filter((context) => {
    return (
      (!filters.school || context.schools?.name === filters.school) &&
      (!filters.year || context.year === Number(filters.year)) &&
      (!filters.grade || context.grade === Number(filters.grade)) &&
      (!filters.term || context.term === Number(filters.term))
    )
  })

  const toggleContext = (contextId: string, active: boolean) => {
    setActiveContexts((prev) => ({
      ...prev,
      [contextId]: active,
    }))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Active Academic Contexts</CardTitle>
        <CardDescription>
          Set which academic periods are currently active. Students will see results for active contexts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filters.school}
              onChange={e => setFilters((f) => ({ ...f, school: e.target.value }))}
            >
              <option value="">All</option>
              {schoolOptions.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filters.year}
              onChange={e => setFilters((f) => ({ ...f, year: e.target.value }))}
            >
              <option value="">All</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}-{Number(year)+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filters.grade}
              onChange={e => setFilters((f) => ({ ...f, grade: e.target.value }))}
            >
              <option value="">All</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Term</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={filters.term}
              onChange={e => setFilters((f) => ({ ...f, term: e.target.value }))}
            >
              <option value="">All</option>
              {termOptions.map((term) => (
                <option key={term} value={term}>{term === 1 ? "First" : "Second"} Term</option>
              ))}
            </select>
          </div>
        </div>
        {/* Contexts List */}
        <div className="space-y-4">
          {filteredContexts.length > 0 ? (
            filteredContexts.map((context) => (
              <AcademicContextRow
                key={context.id}
                context={context}
                isActive={activeContexts[context.id] || false}
                onToggle={(checked) => toggleContext(context.id, checked)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No academic contexts found. Upload some student results first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
