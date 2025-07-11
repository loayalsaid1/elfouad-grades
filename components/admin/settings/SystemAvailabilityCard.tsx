import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Power, Eye, EyeOff } from "lucide-react"

interface SystemAvailabilityCardProps {
  systemEnabled: boolean
  setSystemEnabled: (v: boolean) => void
}

export function SystemAvailabilityCard({
  systemEnabled,
  setSystemEnabled,
}: SystemAvailabilityCardProps) {
  return (
    <Card className="mb-6 shadow-xl border-2 hover:border-[#223152] transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-white flex items-center text-base sm:text-lg">
          <div className="bg-white/20 p-1 sm:p-2 rounded-full mr-2 sm:mr-3">
            <Power className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          System Availability
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs sm:text-sm mt-1">
          Control whether students can access the results system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className={`p-3 sm:p-6 border-2 rounded-lg transition-all duration-300 ${
          systemEnabled 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`p-2 sm:p-3 rounded-full ${
                systemEnabled ? "bg-green-100" : "bg-red-100"
              }`}>
                {systemEnabled ? (
                  <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                )}
              </div>
              <div>
                <Label htmlFor="system-enabled" className="text-base sm:text-lg font-semibold text-[#223152] cursor-pointer">
                  System is {systemEnabled ? "enabled" : "disabled"}
                </Label>
                {!systemEnabled && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1 font-medium">
                    ⚠️ Students will see a maintenance message when system is disabled
                  </p>
                )}
                {systemEnabled && (
                  <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                    ✓ Students can access the results portal
                  </p>
                )}
              </div>
            </div>
            <Switch 
              id="system-enabled" 
              checked={systemEnabled} 
              onCheckedChange={setSystemEnabled}
              className="data-[state=checked]:bg-[#223152] scale-110 sm:scale-125 ml-auto"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
