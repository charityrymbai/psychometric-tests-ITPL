"use client"

import { ReactNode, useState } from "react"
import {TreeSidebar} from "@/components/tree-sidebar"
import { GroupForm } from "@/components/group-form"
import { SectionForm } from "@/components/section-form"
import groupsRaw from "@/data/groups.json";
import QuestionCreatePage from "./question-create";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editQuestionSection, setEditQuestionSection] = useState<any | null>(null);
  function handleCreateQuestion(section: any) {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setEditQuestionSection(section);
    setShowQuestionForm(true);
  }
  function handleCloseQuestionForm() {
    setShowQuestionForm(false);
    setEditQuestionSection(null);
  }
  // Transform groupsRaw to TreeSidebar format
  const groups = groupsRaw.map((group: any) => ({
    id: String(group.id),
    name: group.name,
    sections: (group.sections || []).map((section: any) => ({
      id: String(section.id),
      name: section.name,
      description: section.description || "",
      questions: section.questions || 0
    }))
  }));

  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editGroupData, setEditGroupData] = useState<any | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSectionData, setEditSectionData] = useState<any | null>(null);
  const [editSectionMode, setEditSectionMode] = useState<'add' | 'edit'>('add');
  function handleAddSection() {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setEditSectionData(null);
    setEditSectionMode('add');
    setShowSectionForm(true);
  }
  function handleCloseSectionForm() {
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
  }
  function handleSubmitSection(section: any) {
    // TODO: handle section submission (e.g., API call)
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
  }

  function handleEditSection(section: any) {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setEditSectionData(section);
    setEditSectionMode('edit');
    setShowSectionForm(true);
  }

  function handleItemSelect(item: { type: string; id: string }) {
    setSelectedItem(item);
  }

  function handleAddGroup() {
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setEditGroupData(null);
    setShowGroupForm(true);
  }

  function handleCloseGroupForm() {
    setShowGroupForm(false);
    setEditGroupData(null);
  }

  function handleSubmitGroup(group: any) {
    // TODO: handle group submission (e.g., API call)
    setShowGroupForm(false);
    setEditGroupData(null);
  }

  function handleEditGroup(group: any) {
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setEditGroupData(group);
    setShowGroupForm(true);
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-80 border-r bg-white">
        <TreeSidebar
          data={groups}
          onItemSelect={handleItemSelect}
          selectedItem={selectedItem}
          onAddGroup={handleAddGroup}
          onEditGroup={handleEditGroup}
          onAddSection={handleAddSection}
          onEditSection={handleEditSection}
          onCreateQuestion={handleCreateQuestion}
        />
      </aside>
      {showGroupForm && (
        <div className="w-full border-l bg-white p-6 grid place-items-center">
          <GroupForm
            open={true}
            onClose={handleCloseGroupForm}
            onSubmit={handleSubmitGroup}
            initialData={editGroupData}
          />
        </div>
      )}
      {showSectionForm && (
        <div className="w-full border-l bg-white p-6 grid place-items-center">
          <SectionForm
            open={true}
            onClose={handleCloseSectionForm}
            onSubmit={handleSubmitSection}
            initialData={editSectionData}
          />
        </div>
      )}
      {showQuestionForm && (
        <div className="w-full border-l bg-white p-6 grid place-items-center">
          <QuestionCreatePage
            open={true}
            section={editQuestionSection}
            onClose={handleCloseQuestionForm}
          />
        </div>
      )}
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {children}
      </main>
    </div>
  )
}
