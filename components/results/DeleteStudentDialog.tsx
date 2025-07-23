"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { StudentResult } from "@/types/student"

interface DeleteStudentDialogProps {
  open: boolean
  student: StudentResult | null
  onCancel: () => void
  onConfirm: () => void
  pending: boolean
}

export function DeleteStudentDialog({
  open,
  student,
  onCancel,
  onConfirm,
  pending,
}: DeleteStudentDialogProps) {
  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Student
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{student.name}</strong> (ID: {student.id})?
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone. All test results for this student in the current academic context will be permanently deleted.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {pending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
