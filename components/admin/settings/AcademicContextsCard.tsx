import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

function getOptions(contexts: any[]) {
  const schoolOptions = Array.from(new Set(contexts.map((c: any) => c.schools?.name).filter(Boolean)))
  const yearOptions = Array.from(new Set(contexts.map((c: any) => c.year))).sort((a, b) => b - a)
  const gradeOptions = Array.from(new Set(contexts.map((c: any) => c.grade))).sort((a, b) => a - b)
  const termOptions = Array.from(new Set(contexts.map((c: any) => c.term))).sort()
  return { schoolOptions, yearOptions, gradeOptions, termOptions }
}

export function AcademicContextsCard({
  contexts,
  activeContexts,
  setActiveContexts,
  filters,
  setFilters,
}: {
  contexts: any[],
  activeContexts: { [key: string]: boolean },
  setActiveContexts: (v: any) => void,
  filters: { year: string, grade: string, term: string, school: string },
  setFilters: (v: any) => void,
}) {
  const { schoolOptions, yearOptions, gradeOptions, termOptions } = getOptions(contexts)

  const filteredContexts = contexts.filter((context: any) => {
    return (
      (!filters.school || context.schools?.name === filters.school) &&
      (!filters.year || context.year === Number(filters.year)) &&
      (!filters.grade || context.grade === Number(filters.grade)) &&
      (!filters.term || context.term === Number(filters.term))
    )
  })

  const toggleContext = (contextId: string, active: boolean) => {
    setActiveContexts((prev: any) => ({
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
              onChange={e => setFilters((f: any) => ({ ...f, school: e.target.value }))}
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
              onChange={e => setFilters((f: any) => ({ ...f, year: e.target.value }))}
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
              onChange={e => setFilters((f: any) => ({ ...f, grade: e.target.value }))}
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
              onChange={e => setFilters((f: any) => ({ ...f, term: e.target.value }))}
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
            filteredContexts.map((context: any) => (
              <div
                key={context.id}
                className="flex items-center justify-between border-b pb-3"
              >
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
                <Switch
                  checked={activeContexts[context.id] || false}
                  onCheckedChange={(checked) => toggleContext(context.id, checked)}
                />
              </div>
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
