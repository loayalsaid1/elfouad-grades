import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Change {
  id: string
  name: string
  from: boolean
  to: boolean
}

interface ActiveContextsConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  changes: Change[]
  pendingSave: boolean
  onConfirm: () => void
}

export function ActiveContextsConfirmDialog({
  open,
  onOpenChange,
  changes,
  pendingSave,
  onConfirm,
}: ActiveContextsConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Changes to Active Contexts</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {changes.length === 0 ? (
            <div>No changes detected.</div>
          ) : (
            <ul className="space-y-1">
              {changes.map((chg) => (
                <li key={chg.id} className="text-sm">
                  <span className="font-medium">{chg.name}:</span> {chg.from ? "Active" : "Inactive"} → <span className={chg.to ? "text-green-700 font-semibold" : "text-gray-500"}>{chg.to ? "Active" : "Inactive"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pendingSave}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pendingSave}>
            {pendingSave ? "Saving..." : "Confirm and Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
