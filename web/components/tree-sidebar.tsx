"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Plus, ChevronDown, ChevronRight } from "lucide-react";

interface Section {
  id: string;
  name: string;
  description: string;
  questions: number;
}

interface Group {
  id: string;
  name: string;
  sections: Section[];
}

interface TreeSidebarProps {
  data: Group[];
  onItemSelect: (item: { type: string; id: string }) => void;
  selectedItem: { type: string; id: string } | null;
  onAddGroup?: () => void;
  onEditGroup?: (group: Group) => void;
  onAddSection?: (groupId: string, section?: { name: string; description: string; questions: number }) => void;
  onEditSection?: (section: Section) => void;
  onCreateQuestion?: (section: Section) => void;
  onDeleteGroup?: (groupId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function TreeSidebar({
  data,
  onItemSelect,
  selectedItem,
  onAddGroup,
  onEditGroup,
  onAddSection,
  onEditSection,
  onCreateQuestion,
  onDeleteGroup,
  onDeleteSection,
}: TreeSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    type: "group" | "section" | null;
    data: any;
  }>({ x: 0, y: 0, type: null, data: null });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGroupMenu = (action: string, group: Group) => {
    setMenu({ x: 0, y: 0, type: null, data: null });
    if (action === "edit" && onEditGroup) onEditGroup(group);
    else if (action === "delete") {
      // TODO: Implement group delete logic here (API call or state update)
      if (onDeleteGroup) onDeleteGroup(group.id);
    }
    else if (action === "add-section" && onAddSection) onAddSection(group.id);
    else if (action === "add-test") alert(`Add test to group: ${group.name}`);
  };

  const handleSectionMenu = (action: string, section: Section) => {
    setMenu({ x: 0, y: 0, type: null, data: null });
    if (action === "edit" && onEditSection) onEditSection(section);
    else if (action === "delete") {
      // TODO: Implement section delete logic here (API call or state update)
      if (onDeleteSection) onDeleteSection(section.id);
    }
    else if (action === "add-question" && onCreateQuestion) onCreateQuestion(section);
  };

  return (
    <div className="w-full h-full border-r relative">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="text-lg font-semibold">Settings</h2>
        {onAddGroup && (
          <Button size="sm" variant="outline" onClick={onAddGroup}>
            <Plus className="w-4 h-4 mr-1" />
            Add Group
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] p-2">
        <div className="space-y-2">
          {data.map((group) => (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <div className="flex items-center justify-between group px-2 py-1 rounded hover:bg-muted transition">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center gap-1"
                >
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span
                    onClick={() => onItemSelect({ type: "group", id: group.id })}
                    className={cn(
                      "text-sm font-medium cursor-pointer",
                      selectedItem?.type === "group" && selectedItem?.id === group.id
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {group.name}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu({ x: e.clientX, y: e.clientY, type: "group", data: group });
                  }}
                  className="invisible group-hover:visible"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Sections */}
              {expandedGroups.includes(group.id) && (
                <div className="ml-5 space-y-1">
                  {group.sections.map((section) => (
                    <div key={section.id} className="space-y-1">
                      {/* Section Header */}
                      <div className="flex items-center justify-between group px-2 py-1 rounded hover:bg-muted transition">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="flex items-center gap-1"
                        >
                          {expandedSections.includes(section.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span
                            onClick={() =>
                              onItemSelect({ type: "section", id: section.id })
                            }
                            className={cn(
                              "text-sm cursor-pointer",
                              selectedItem?.type === "section" &&
                                selectedItem?.id === section.id
                                ? "text-primary font-medium"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          >
                            {section.name}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenu({
                              x: e.clientX,
                              y: e.clientY,
                              type: "section",
                              data: section,
                            });
                          }}
                          className="invisible group-hover:visible"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Section Details */}
                      {expandedSections.includes(section.id) && (
                        <div className="ml-2 mb-2 p-2 bg-gray-50 rounded border text-xs text-gray-700">
                          <div><span className="font-semibold">Description:</span> {section.description || "No description"}</div>
                          <div><span className="font-semibold">Questions:</span> {section.questions}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Context Menu */}
      {menu.type && (
        <div
          className="absolute z-50 bg-white border rounded shadow-md"
          style={{ top: menu.y, left: menu.x }}
          onMouseLeave={() => setMenu({ x: 0, y: 0, type: null, data: null })}
        >
          {menu.type === "group" ? (
            <div className="py-1">
              <MenuItem onClick={() => handleGroupMenu("edit", menu.data)} label="Edit Group" />
              <MenuItem onClick={() => handleGroupMenu("add-section", menu.data)} label="Add Section / Test" />
              <MenuItem onClick={() => handleGroupMenu("delete", menu.data)} label="Delete Group" danger />
            </div>
          ) : (
            <div className="py-1">
              <MenuItem onClick={() => handleSectionMenu("edit", menu.data)} label="Edit Section" />
              <MenuItem onClick={() => handleSectionMenu("add-question", menu.data)} label="Create Question" />
              <MenuItem onClick={() => handleSectionMenu("delete", menu.data)} label="Delete Section" danger />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  label,
  danger = false,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm cursor-pointer hover:bg-muted transition",
        danger ? "text-red-600" : ""
      )}
    >
      {label}
    </div>
  );
}
