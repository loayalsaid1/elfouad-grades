import { useState, useEffect, useMemo, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StudentResult } from "@/types/student"

interface EditStudentDialogProps {
  open: boolean
  student: StudentResult | null
  onCancel: () => void
  onSave: (updated: StudentResult) => Promise<boolean>
  pending: boolean
  error: string | null
}

export function EditStudentDialog({
  open,
  student,
  onCancel,
  onSave,
  pending,
  error,
}: EditStudentDialogProps) {
  const [step, setStep] = useState<"edit" | "confirm">("edit")
  const [form, setForm] = useState<StudentResult | null>(student)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [errorFields, setErrorFields] = useState<number[]>([])
  const contentRef = useRef<HTMLDivElement>(null) // Add ref for scrolling

  // Compute changes for highlighting
  const changes = useMemo(() => {
    if (!student || !form) return null
    const changed: Record<string, boolean> = {}
    if (form.name !== student.name) changed["name"] = true
    form.scores.forEach((s, idx) => {
      const orig = student.scores[idx]
      if (!orig) return
      if (s.score !== orig.score) changed[`score-${idx}`] = true
      if (s.absent !== orig.absent) changed[`absent-${idx}`] = true
    })
    return changed
  }, [form, student])

  // Reset form when student changes
  useEffect(() => {
    setForm(student)
    setStep("edit")
    setValidationError(null)
    setErrorFields([])
  }, [student])

  if (!form) return null

  const handleField = (field: keyof StudentResult, value: any) => {
    setForm(f => f ? { ...f, [field]: value } : f)
  }

  const handleScoreChange = (idx: number, field: string, value: any) => {
    setForm(f => {
      if (!f) return f
      const scores = [...f.scores]
      scores[idx] = { ...scores[idx], [field]: value }
      // If absent is checked, set score to null
      if (field === "absent" && value) scores[idx].score = null
      return { ...f, scores }
    })
  }

  // Validation: ensure all non-absent scores are filled and are valid numbers
  const validateForm = () => {
    if (!form) return false
    const invalid: number[] = []
    form.scores.forEach((s, idx) => {
      if (!s.absent && (s.score === null || s.score === "" || isNaN(Number(s.score)))) {
        invalid.push(idx)
      }
    })
    setErrorFields(invalid)
    if (invalid.length > 0) {
      setValidationError(`Please enter a valid score for all non-absent subjects.`)
      return false
    }
    setValidationError(null)
    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      setStep("confirm")
      // Scroll to top of dialog content
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0
        }
      }, 0)
    }
  }
  const handleBack = () => setStep("edit")

  const handleSave = async () => {
    if (form) {
      const ok = await onSave(form)
      if (ok) setStep("edit")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col rounded-lg shadow-lg border border-gray-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#223152]">Edit Student Data</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {validationError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        <div
          className="overflow-y-auto flex-1 min-h-0 max-h-[60vh] px-1"
          ref={contentRef}
        >
          {step === "edit" && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext() }}>
              <div>
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <Input
                  value={form.name}
                  onChange={e => handleField("name", e.target.value)}
                  disabled={pending}
                  className="rounded border-gray-300 focus:border-[#223152] focus:ring-[#223152]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <Input value={form.id} disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scores</label>
                <div className="space-y-2">
                  {form.scores.map((s, idx) => (
                    <div key={s.subject} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                      <span className="w-32 font-medium">{s.subject}</span>
                      <Input
                        type="number"
                        step="any"
                        value={s.absent ? "" : s.score ?? ""}
                        onChange={e => handleScoreChange(idx, "score", e.target.value === "" ? null : parseFloat(e.target.value))}
                        disabled={pending || s.absent}
                        className={
                          `w-24 rounded border-2 transition-colors duration-150 ` +
                          (errorFields.includes(idx)
                            ? "border-red-500 focus:border-red-600 bg-red-50"
                            : "border-gray-300 focus:border-[#223152] focus:ring-[#223152]/30")
                        }
                        min="0"
                        max={s.full_mark}
                      />
                      <span className="text-xs text-gray-500">/ {s.full_mark}</span>
                      <label className="ml-4 flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={!!s.absent}
                          onChange={e => handleScoreChange(idx, "absent", e.target.checked)}
                          disabled={pending}
                        />
                        Absent
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
                <Button type="submit" className="bg-[#223152] text-white" disabled={pending}>Next</Button>
              </DialogFooter>
            </form>
          )}
          {step === "confirm" && (
            <div>
              <div className="mb-4">
                <div className="font-semibold text-[#223152]">Confirm changes for:</div>
                <div className={changes?.name ? "mb-2 font-bold text-blue-700" : "mb-2"}>
                  {form.name} (ID: {form.id})
                  {changes?.name && <span className="ml-2 text-xs text-blue-700">(changed)</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-300 rounded shadow">
                    <thead className="bg-[#223152] text-white">
                      <tr>
                        <th className="border px-3 py-2">Subject</th>
                        <th className="border px-3 py-2">Score</th>
                        <th className="border px-3 py-2">Full Mark</th>
                        <th className="border px-3 py-2">Absent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.scores.map((s, idx) => {
                        const scoreChanged = changes?.[`score-${idx}`]
                        const absentChanged = changes?.[`absent-${idx}`]
                        const orig = student?.scores[idx]
                        return (
                          <tr key={s.subject}
                            className={
                              scoreChanged || absentChanged
                                ? "bg-blue-50 font-semibold"
                                : "bg-white"
                            }
                          >
                            <td className="border px-3 py-2">{s.subject}</td>
                            <td className="border px-3 py-2">
                              {s.absent ? "-" : s.score}
                              {scoreChanged && orig &&
                                <span className="ml-2 text-xs text-gray-500">
                                  (was <span className="text-red-700">{orig.absent ? "-" : orig.score}</span>)
                                </span>
                              }
                              {scoreChanged && <span className="ml-1 text-xs text-blue-700">(changed)</span>}
                            </td>
                            <td className="border px-3 py-2">{s.full_mark}</td>
                            <td className="border px-3 py-2">
                              {s.absent ? "Yes" : ""}
                              {absentChanged && orig &&
                                <span className="ml-2 text-xs text-gray-500">
                                  (was <span className="text-red-700">{orig.absent ? "Yes" : ""}</span>)
                                </span>
                              }
                              {absentChanged && <span className="ml-1 text-xs text-blue-700">(changed)</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={handleBack} disabled={pending}>Back</Button>
                <Button type="button" className="bg-[#223152] text-white" onClick={handleSave} disabled={pending}>Confirm & Save</Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
