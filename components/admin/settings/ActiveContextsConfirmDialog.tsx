import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

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
      <DialogContent className="sm:max-w-lg shadow-2xl border-2">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#223152] flex items-center">
            <div className="bg-[#223152] p-2 rounded-full mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            Confirm Changes to Active Contexts
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {changes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No changes detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                The following contexts will be updated:
              </p>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {changes.map((chg) => (
                  <li key={chg.id} className="p-3 bg-gray-50 rounded-lg border transition-all duration-200">
                    <div className="text-sm font-medium text-[#223152] mb-1">{chg.name}</div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        chg.from ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {chg.from ? "Active" : "Inactive"}
                      </span>
                      <span>→</span>
                      <span className={`px-2 py-1 rounded font-semibold ${
                        chg.to ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {chg.to ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={pendingSave}
            className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={pendingSave}
            className="bg-[#223152] hover:bg-[#1a2642] text-white transition-all duration-300"
          >
            {pendingSave ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm and Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
