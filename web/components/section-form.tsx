import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export interface Section {
  id?: string;
  name: string;
  description?: string;
  questions?: number;
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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...initialData, name, description });
    onClose();
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Section" : "Add Section"}
        </h2>
      </div>
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? "Save" : "Create"}</Button>
        </div>
      </form>
    </div>
  );
}
