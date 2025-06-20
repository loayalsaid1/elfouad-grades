import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SystemAvailabilityCardProps {
  systemEnabled: boolean
  setSystemEnabled: (v: boolean) => void
}

export function SystemAvailabilityCard({
  systemEnabled,
  setSystemEnabled,
}: SystemAvailabilityCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>System Availability</CardTitle>
        <CardDescription>Control whether students can access the results system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch id="system-enabled" checked={systemEnabled} onCheckedChange={setSystemEnabled} />
          <Label htmlFor="system-enabled">System is {systemEnabled ? "enabled" : "disabled"}</Label>
        </div>
        {!systemEnabled && (
          <p className="text-sm text-amber-600 mt-2">⚠️ When disabled, students will see a maintenance message</p>
        )}
      </CardContent>
    </Card>
  )
}
