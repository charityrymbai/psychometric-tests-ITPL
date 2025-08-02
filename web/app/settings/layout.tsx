"use client"

import { ReactNode, useState } from "react"
import {TreeSidebar} from "@/components/tree-sidebar"
import { GroupForm } from "@/components/group-form"
import { SectionForm } from "@/components/section-form"
import SectionDetails from "@/components/section-details"
// import groupsRaw from "@/data/groups.json";
import { useEffect } from "react";
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
}
import QuestionCreatePage from "./question-create";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editQuestionSection, setEditQuestionSection] = useState<any | null>(null);
  const [showSectionDetails, setShowSectionDetails] = useState(false);
  const [sectionDetailsData, setSectionDetailsData] = useState<any | null>(null);
  function handleCreateQuestion(section: any) {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setShowSectionDetails(false);
    setSectionDetailsData(null);
    setEditQuestionSection(section);
    setShowQuestionForm(true);
  }
  function handleCloseQuestionForm() {
    setShowQuestionForm(false);
    setEditQuestionSection(null);
  }
  // Fetch groups and sections from API
  const [groups, setGroups] = useState<any[]>([]);
  const fetchGroups = async () => {
    const res = await fetch(`${BACKEND_BASE_URL}/all`);
    const data = await res.json();
    console.log(sectionDetailsData, "Fetched groups:", data);
    const formatted = (data || []).map((group: any) => ({
      id: String(group.id),
      name: group.name,
      sections: (group.sections || []).map((section: any) => ({
        id: String(section.id),
        name: section.name,
        description: section.description || "",
        questions: section.questions || 0,
        groupId: String(group.id)
      }))
    }));
    setGroups(formatted);
  };
  useEffect(() => {
    fetchGroups();
  }, []);

  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editGroupData, setEditGroupData] = useState<any | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSectionData, setEditSectionData] = useState<any | null>(null);
  const [editSectionMode, setEditSectionMode] = useState<'add' | 'edit'>('add');
  const [selectedGroupIdForSection, setSelectedGroupIdForSection] = useState<string | null>(null);
  function handleAddSection(groupId: string) {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setShowSectionDetails(false);
    setSectionDetailsData(null);
    setEditSectionData(null);
    setEditSectionMode('add');
    setSelectedGroupIdForSection(groupId);
    setShowSectionForm(true);
  }
  function handleCloseSectionForm() {
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setSelectedGroupIdForSection(null); // Clear the selected group ID
  }

async function addSection(section: any, groupId: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const payload: any = {
    name: section.name,
    description: section.description,
    isSingleOptionCorrect: !!section.isSingleOptionCorrect
  };
  
  // Include tags if the section is not single option correct and has tags
  if (!section.isSingleOptionCorrect && Array.isArray(section.tags) && section.tags.length > 0) {
    payload.tags = section.tags.map((tag: any) => ({
      name: tag.label || tag.name,
      description: tag.description
    }));
  }
  
  const raw = JSON.stringify(payload);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw
  };
  const res = await fetch(`${BACKEND_BASE_URL}/sections/create/${groupId}`, requestOptions);
  if (!res.ok) throw new Error('Failed to add section');
  return await res.json();
}

async function handleSubmitSection(section: any) {
  try {
    if (editSectionMode === 'edit' && editSectionData?.id) {
      // Update existing section
      const groupId = section.groupId || editSectionData.groupId || selectedGroupIdForSection || (selectedItem && selectedItem.type === 'group' && selectedItem.id);
      if (!groupId) throw new Error('No groupId found for section update');
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      const payload: any = {
        name: section.name,
        description: section.description,
        isSingleOptionCorrect: !!section.isSingleOptionCorrect
      };
      
      // Include tags if the section is not single option correct and has tags
      if (!section.isSingleOptionCorrect && Array.isArray(section.tags) && section.tags.length > 0) {
        payload.tags = section.tags.map((tag: any) => ({
          name: tag.label || tag.name,
          description: tag.description
        }));
      }
      
      const res = await fetch(`${BACKEND_BASE_URL}/sections/${groupId}/${editSectionData.id}`, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update section');
    } else {
      // Create new section
      const groupId = section.groupId || (editSectionData && editSectionData.groupId) || selectedGroupIdForSection || (selectedItem && selectedItem.type === 'group' && selectedItem.id);
      if (!groupId) throw new Error('No groupId found for section');
      await addSection(section, groupId);
    }
    
    await fetchGroups(); // Refresh groups after adding/updating section
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setSelectedGroupIdForSection(null); // Clear the selected group ID
  } catch (err) {
    alert('Failed to save section: ' + err);
    console.error(err);
  }
}

  async function handleEditSection(section: any) {
    setShowGroupForm(false);
    setEditGroupData(null);
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setShowSectionDetails(false);
    setSectionDetailsData(null);
    
    // Ensure groupId is present
    let sectionWithGroupId = section;
    if (!section.groupId) {
      const parentGroup = groups.find(g => g.sections.some((s: any) => s.id === section.id));
      if (parentGroup) {
        sectionWithGroupId = { ...section, groupId: parentGroup.id };
      }
    }
    
    try {
      // Fetch the full section data including tags
      const res = await fetch(`${BACKEND_BASE_URL}/questions/${section.id}`);
      if (res.ok) {
        const sectionData = await res.json();
        // Merge the fetched data with the existing section data
        const fullSectionData = {
          ...sectionWithGroupId,
          isSingleOptionCorrect: sectionData.isSingleOptionCorrect,
          tags: sectionData.tags || []
        };
        setEditSectionData(fullSectionData);
      } else {
        // Fallback to using existing data if fetch fails
        setEditSectionData(sectionWithGroupId);
      }
    } catch (error) {
      console.error('Failed to fetch section tags:', error);
      // Fallback to using existing data
      setEditSectionData(sectionWithGroupId);
    }
    
    setEditSectionMode('edit');
    setShowSectionForm(true);
  }

  function handleItemSelect(item: { type: string; id: string }) {
    setSelectedItem(item);
    if (item.type === 'section') {
      // Find the section data
      const section = groups.flatMap(g => g.sections).find(s => s.id === item.id);
      if (section) {
        setShowGroupForm(false);
        setEditGroupData(null);
        setShowSectionForm(false);
        setEditSectionData(null);
        setEditSectionMode('add');
        setShowQuestionForm(false);
        setEditQuestionSection(null);
        setShowSectionDetails(true);
        setSectionDetailsData(section);
      }
    } else {
      setShowSectionDetails(false);
      setSectionDetailsData(null);
    }
  }

  function handleAddGroup() {
    setShowSectionForm(false);
    setEditSectionData(null);
    setEditSectionMode('add');
    setShowQuestionForm(false);
    setEditQuestionSection(null);
    setShowSectionDetails(false);
    setSectionDetailsData(null);
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
      {showSectionDetails && sectionDetailsData && (
        <div className="w-full border-l bg-white p-6 grid place-items-center">
          <SectionDetails
            open={true}
            section={sectionDetailsData}
            onClose={() => {
              setShowSectionDetails(false);
              setSectionDetailsData(null);
              setSelectedItem(null);
            }}
          />
        </div>
      )}
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {children}
      </main>
    </div>
  )
}
