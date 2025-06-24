import { useState, useEffect } from "react"
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

  // Reset form when student changes
  useEffect(() => {
    setForm(student)
    setStep("edit")
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

  const handleNext = () => setStep("confirm")
  const handleBack = () => setStep("edit")

  const handleSave = async () => {
    if (form) {
      const ok = await onSave(form)
      if (ok) setStep("edit")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Student Data</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="overflow-y-auto flex-1 min-h-0 max-h-[60vh] px-1">
          {step === "edit" && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleNext() }}>
              <div>
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <Input
                  value={form.name}
                  onChange={e => handleField("name", e.target.value)}
                  disabled={pending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <Input value={form.id} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scores</label>
                <div className="space-y-2">
                  {form.scores.map((s, idx) => (
                    <div key={s.subject} className="flex items-center gap-2">
                      <span className="w-32">{s.subject}</span>
                      <Input
                        type="number"
                        value={s.absent ? "" : s.score ?? ""}
                        onChange={e => handleScoreChange(idx, "score", e.target.value === "" ? null : Number(e.target.value))}
                        disabled={pending || s.absent}
                        className="w-20"
                        min={0}
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
                <Button type="submit" className="bg-[#223152] text-white" disabled={pending}>Next</Button>
              </DialogFooter>
            </form>
          )}
          {step === "confirm" && (
            <div>
              <div className="mb-4">
                <div className="font-semibold">Confirm changes for:</div>
                <div className="mb-2">{form.name} (ID: {form.id})</div>
                <div>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="border px-2">Subject</th>
                        <th className="border px-2">Score</th>
                        <th className="border px-2">Full Mark</th>
                        <th className="border px-2">Absent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.scores.map(s => (
                        <tr key={s.subject}>
                          <td className="border px-2">{s.subject}</td>
                          <td className="border px-2">{s.absent ? "-" : s.score}</td>
                          <td className="border px-2">{s.full_mark}</td>
                          <td className="border px-2">{s.absent ? "Yes" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <DialogFooter>
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
