import { AlertCircle, Save, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void | Promise<void>
  onDiscard: () => void
  title?: string
  description?: string
  saveLabel?: string
  discardLabel?: string
  isSaving?: boolean
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  title = "Unsaved Changes",
  description = "You have unsaved changes. What would you like to do?",
  saveLabel = "Save Changes",
  discardLabel = "Discard Changes",
  isSaving = false
}: UnsavedChangesDialogProps) {
  const handleSave = async () => {
    await onSave()
    onOpenChange(false)
  }

  const handleDiscard = () => {
    onDiscard()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : saveLabel}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDiscard}
            disabled={isSaving}
            className="w-full"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {discardLabel}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
