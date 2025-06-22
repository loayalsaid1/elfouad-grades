"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"

interface ParentPasswordDialogProps {
  open: boolean
  onCancel: () => void
  onSubmit: (password: string) => Promise<void>
  loading: boolean
  error: string | null
  studentName?: string
}

export default function ParentPasswordDialog({
  open,
  onCancel,
  onSubmit,
  loading,
  error,
  studentName,
}: ParentPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (password.trim()) {
        await onSubmit(password.trim())
      }
    },
    [password, onSubmit]
  )

  const handleCancel = useCallback(() => {
    setPassword("")
    setShowPassword(false)
    onCancel()
  }, [onCancel])

  return (
    <Dialog open={open} onOpenChange={() => !loading && handleCancel()}>
      <DialogContent className="sm:max-w-md shadow-2xl border-2">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#223152]">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl text-[#223152]">Parent Password Required</DialogTitle>
          <DialogDescription className="text-gray-600">
            {studentName ? `Access to ${studentName}'s results` : "Access to student results"} requires a parent password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#223152]">
              Parent Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter parent password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10 focus:border-[#223152] focus:ring-[#223152] transition-all duration-300"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || loading}
              className="bg-[#223152] hover:bg-[#1a2642] text-white transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Access Results
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
