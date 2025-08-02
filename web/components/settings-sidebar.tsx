"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, MessageSquare } from "lucide-react"
import { TreeSidebar } from "@/components/tree-sidebar"

export function SettingsSidebar() {
  const [view, setView] = useState<"main" | "groups">("main")

  if (view === "groups") {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Groups</h2>
          <Button variant="ghost" size="sm" onClick={() => setView("main")}>Back</Button>
        </div>
        <TreeSidebar
          data={[]}
          selectedItem={{ type: "home", id: "home" }}
          onItemSelect={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
      </div>
      <div className="flex-1 flex flex-col gap-2 p-4">
        <Button variant="outline" className="justify-start" onClick={() => setView("groups")}> 
          <Users className="w-4 h-4 mr-2" /> Groups
        </Button>
        <Button variant="outline" className="justify-start" disabled>
          <BookOpen className="w-4 h-4 mr-2" /> Sections / Tests
        </Button>
        <Button variant="outline" className="justify-start" disabled>
          <MessageSquare className="w-4 h-4 mr-2" /> Questions
        </Button>
      </div>
    </div>
  )
}
