import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AcademicContextRow } from "./AcademicContextRow"
import type { AcademicContext, SettingsPageFilters, School } from "@/hooks/useSettingsPage"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AcademicContextsCardProps {
  contexts: AcademicContext[]
  schools: School[]
  activeContexts: Record<string, boolean>
  setActiveContexts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  filters: SettingsPageFilters
  setFilters: React.Dispatch<React.SetStateAction<SettingsPageFilters>>
  deleteContext: (contextId: string) => void 
}

function getOptions(contexts: AcademicContext[], schools: School[]) {
  const schoolOptions = schools.map(school => school.name)
  const yearOptions = Array.from(new Set(contexts.map((c) => c.year))).sort((a, b) => b - a)
  const gradeOptions = Array.from(new Set(contexts.map((c) => c.grade))).sort((a, b) => a - b)
  const termOptions = Array.from(new Set(contexts.map((c) => c.term))).sort()
  return { schoolOptions, yearOptions, gradeOptions, termOptions }
}

export function AcademicContextsCard({
  contexts,
  schools,
  activeContexts,
  setActiveContexts,
  filters,
  setFilters,
  deleteContext,
}: AcademicContextsCardProps) {
  const { schoolOptions, yearOptions, gradeOptions, termOptions } = getOptions(contexts, schools)

  const filteredContexts = contexts.filter((context) => {
    return (
      (!filters.school || context.schools?.name === filters.school) &&
      (!filters.year || context.year === Number(filters.year)) &&
      (!filters.grade || context.grade === Number(filters.grade)) &&
      (!filters.term || context.term === Number(filters.term))
    )
  })

  const toggleContext = (contextId: string, active: boolean) => {
    // Find the context being toggled
    const toggledContext = contexts.find((c) => c.id === contextId)
    if (!toggledContext) return setActiveContexts((prev) => ({ ...prev, [contextId]: active }))

    setActiveContexts((prev) => {
      // If activating, detoggle all with same school and grade
      if (active) {
        const updated: Record<string, boolean> = { ...prev }
        contexts.forEach((c) => {
          if (
            c.schools?.name === toggledContext.schools?.name &&
            c.grade === toggledContext.grade
          ) {
            updated[c.id] = c.id === contextId
          }
        })
        return updated
      } else {
        // Just deactivate this one
        return { ...prev, [contextId]: false }
      }
    })
  }

  const [pendingDelete, setPendingDelete] = useState<AcademicContext | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    await deleteContext(pendingDelete.id)
    setDeleting(false)
    setPendingDelete(null)
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
                onDelete={() => setPendingDelete(context)}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No academic contexts found. Upload some student results first.
            </p>
          )}
        </div>
        {/* Delete Confirmation Modal */}
        <Dialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Academic Context?</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              Are you sure you want to delete the context for <b>{pendingDelete?.schools?.name || "Unknown School"}</b>, year <b>{pendingDelete?.year}-{pendingDelete ? pendingDelete.year + 1 : ""}</b>, grade <b>{pendingDelete?.grade}</b>, term <b>{pendingDelete?.term === 1 ? "First" : "Second"}</b>?<br/>
              <span className="text-red-600 font-semibold">This action cannot be undone.</span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Loader2 className="animate-spin h-4 w-4" /> : ""} Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
