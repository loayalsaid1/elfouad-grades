import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function SaveSettingsButton({ saving, onSave }: { saving: boolean, onSave: () => void }) {
  return (
    <Button onClick={onSave} disabled={saving} className="min-w-[120px]">
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Settings"
      )}
    </Button>
  )
}
