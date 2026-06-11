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
      <CardHeader className="bg-gradient-to-r from-[#223152] to-[#2a3f66] text-white rounded-t-lg">
        <CardTitle className="text-white flex items-center">
          <div className="bg-white/20 p-2 rounded-full mr-3">
            <Power className="h-5 w-5" />
          </div>
          System Availability
        </CardTitle>
        <CardDescription className="text-blue-100">
          Control whether students can access the results system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className={`p-6 border-2 rounded-lg transition-all duration-300 ${
          systemEnabled 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                systemEnabled ? "bg-green-100" : "bg-red-100"
              }`}>
                {systemEnabled ? (
                  <Eye className="h-6 w-6 text-green-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <Label htmlFor="system-enabled" className="text-lg font-semibold text-[#223152] cursor-pointer">
                  System is {systemEnabled ? "enabled" : "disabled"}
                </Label>
                {!systemEnabled && (
                  <p className="text-sm text-red-600 mt-1 font-medium">
                    ⚠️ Students will see a maintenance message when system is disabled
                  </p>
                )}
                {systemEnabled && (
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    ✓ Students can access the results portal
                  </p>
                )}
              </div>
            </div>
            <Switch 
              id="system-enabled" 
              checked={systemEnabled} 
              onCheckedChange={setSystemEnabled}
              className="data-[state=checked]:bg-[#223152] scale-125"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
