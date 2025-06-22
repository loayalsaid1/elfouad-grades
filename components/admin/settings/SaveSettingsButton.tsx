import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

interface SaveSettingsButtonProps {
  saving: boolean
  onSave: () => void
}

export function SaveSettingsButton({ saving, onSave }: SaveSettingsButtonProps) {
  return (
    <Button 
      onClick={onSave} 
      disabled={saving} 
      className="min-w-[150px] bg-[#223152] hover:bg-[#1a2642] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 py-3"
    >
      {saving ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Saving Changes...
        </>
      ) : (
        <>
          <Save className="mr-2 h-5 w-5" />
          Save Settings
        </>
      )}
    </Button>
  )
}
