import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Section {
  id?: string;
  name: string;
  description?: string;
  questions?: number;
  isSingleOptionCorrect?: boolean;
}

interface SectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (section: Section) => void;
  initialData?: Section | null;
}

export function SectionForm({ open, onClose, onSubmit, initialData }: SectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSingleOptionCorrect, setIsSingleOptionCorrect] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setIsSingleOptionCorrect(!!initialData.isSingleOptionCorrect);
    } else {
      setName("");
      setDescription("");
      setIsSingleOptionCorrect(false);
    }
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...initialData, name, description, isSingleOptionCorrect });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Section" : "Add Section"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Name</label>
            <Input
              placeholder="Enter section name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder="Enter description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Single Option Correct</label>
            <Switch
              checked={isSingleOptionCorrect}
              onCheckedChange={setIsSingleOptionCorrect}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Save" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}