import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export interface Group {
  id?: string;
  name: string;
  description?: string;
  startingClass?: number;
  endingClass?: number;
}

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (group: Group) => void;
  initialData?: Group | null;
}

export function GroupForm({ open, onClose, onSubmit, initialData }: GroupFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingClass, setStartingClass] = useState<number | undefined>(undefined);
  const [endingClass, setEndingClass] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setStartingClass(initialData.startingClass);
      setEndingClass(initialData.endingClass);
    } else {
      setName("");
      setDescription("");
      setStartingClass(undefined);
      setEndingClass(undefined);
    }
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ 
      ...initialData, 
      name, 
      description, 
      startingClass: startingClass !== undefined ? startingClass : undefined, 
      endingClass: endingClass !== undefined ? endingClass : undefined 
    });
    onClose();
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Group" : "Add Group"}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Group Name</label>
          <Input
            placeholder="Enter group name"
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
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Starting Class</label>
            <Input
              type="number"
              placeholder="e.g. 1"
              value={startingClass !== undefined ? startingClass : ''}
              onChange={e => setStartingClass(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Ending Class</label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={endingClass !== undefined ? endingClass : ''}
              onChange={e => setEndingClass(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? "Save" : "Create"}</Button>
        </div>
      </form>
    </div>
  );
}
