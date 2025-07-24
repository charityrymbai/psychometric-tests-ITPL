"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, FileText, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GroupManagement } from "@/components/group-management"
import { SectionManagement } from "@/components/section-management"
import { QuestionManagement } from "@/components/question-management"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("groups")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Sections</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Questions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <GroupManagement />
          </TabsContent>

          <TabsContent value="sections">
            <SectionManagement />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
