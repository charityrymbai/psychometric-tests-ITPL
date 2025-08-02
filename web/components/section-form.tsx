import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Section, SectionTag } from "@/src/types/assessment";

// Re-export types for backward compatibility
export type { Section, SectionTag };

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
  const [tags, setTags] = useState<SectionTag[]>([{ id: 0, label: "", description: "" }]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setIsSingleOptionCorrect(!!initialData.isSingleOptionCorrect);
      setTags(
        Array.isArray(initialData.tags) && initialData.tags.length > 0
          ? initialData.tags.map(t => ({ 
              id: t.id || 0,
              label: t.label || "", 
              description: t.description || "" 
            }))
          : [{ id: 0, label: "", description: "" }]
      );
    } else {
      setName("");
      setDescription("");
      setIsSingleOptionCorrect(false);
      setTags([{ id: 0, label: "", description: "" }]);
    }
  }, [initialData, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sectionData: Section = {
      id: initialData?.id || `temp-${Date.now()}`,
      name,
      description,
      isSingleOptionCorrect
    };
    if (!isSingleOptionCorrect) {
      sectionData.tags = tags.filter(t => t.label.trim() !== "" || t.description.trim() !== "");
    } else {
      sectionData.tags = undefined;
    }
    onSubmit(sectionData);
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

          {/* Categories / Tags section, only if not single option correct */}
          {!isSingleOptionCorrect && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Categories / Tags <span className="text-xs text-gray-500">(e.g., Interests, Skills, Topics)</span></label>
              <ul className="mt-2">
                {tags.map((tag, i) => (
                  <li key={i} className="flex flex-col md:flex-row gap-2 mb-3 items-start">
                    <div className="flex-1 w-full">
                      <Input
                        className="mb-2 md:mb-0"
                        value={tag.label}
                        placeholder={`Tag ${i + 1}`}
                        onChange={e => {
                          const newTags = [...tags];
                          newTags[i].label = e.target.value;
                          setTags(newTags);
                        }}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Textarea
                        className="resize-y min-h-[40px] max-h-40"
                        value={tag.description}
                        placeholder={`Description for Tag ${i + 1}`}
                        rows={2}
                        onChange={e => {
                          const newTags = [...tags];
                          newTags[i].description = e.target.value;
                          setTags(newTags);
                        }}
                      />
                    </div>
                    {tags.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="mt-1 md:mt-0"
                        onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                        title="Remove tag"
                      >
                        &minus;
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 flex items-center gap-1"
                onClick={() => setTags([...tags, { id: tags.length, label: "", description: "" }])}
              >
                <span className="text-xl font-bold">+</span> Add Tag
              </Button>
            </div>
          )}
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