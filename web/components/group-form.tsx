import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export interface Group {
  id?: string;
  name: string;
  description?: string;
  fromClass?: string;
  toClass?: string;
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
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setFromClass(initialData.fromClass || "");
      setToClass(initialData.toClass || "");
    } else {
      setName("");
      setDescription("");
      setFromClass("");
      setToClass("");
    }
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...initialData, name, description, fromClass, toClass });
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
            <label className="block text-sm font-medium mb-1">From Class</label>
            <Input
              placeholder="e.g. 1"
              value={fromClass}
              onChange={e => setFromClass(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">To Class</label>
            <Input
              placeholder="e.g. 5"
              value={toClass}
              onChange={e => setToClass(e.target.value)}
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
