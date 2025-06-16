"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface ParentPasswordDialogProps {
  open: boolean
  onSubmit: (password: string) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string
  studentName?: string
}

export default function ParentPasswordDialog({
  open,
  onSubmit,
  onCancel,
  loading,
  error,
  studentName,
}: ParentPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Clear password and error when dialog closes
  useEffect(() => {
    if (!open) {
      setPassword("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (password.trim()) {
      await onSubmit(password.trim())
    }
  }

  const handleCancel = () => {
    setPassword("")
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-[#223152]" />
            <span>Parent Password Required</span>
          </DialogTitle>
          <DialogDescription>
            {studentName ? (
              <>
                This student ({studentName}) is under parent custody. Please enter the parent password to view results.
              </>
            ) : (
              <>This student is under parent custody. Please enter the parent password to view results.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-password">Parent Password</Label>
            <div className="relative">
              <Input
                id="parent-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter parent password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !password.trim()} className="bg-[#223152] hover:bg-[#1a2642]">
              {loading ? <LoadingSpinner size="sm" /> : "Verify"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
