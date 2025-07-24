"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  Play,
} from "lucide-react"

interface TreeSidebarProps {
  selectedItem?: {
    type: "home" | "group" | "section" | "questions" | "test"
    id?: string
    groupId?: string
    sectionId?: string
  }
  onItemSelect?: (item: any) => void
}

export function TreeSidebar({ selectedItem, onItemSelect }: TreeSidebarProps) {
  const safeSelectedItem = selectedItem || { type: "home" };
  const safeOnItemSelect = onItemSelect || (() => {});
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const groups = [
    {
      id: "primary",
      name: "Primary School",
      classes: "Standards 1-5",
      icon: BookOpen,
      color: "text-blue-600",
      sections: [
        {
          id: "verbal-reasoning",
          name: "Verbal Reasoning",
          questionCount: 25,
          questions: [
            { id: "1", text: "Which word is most similar in meaning to 'Happy'?" },
            { id: "2", text: "Choose the word that doesn't belong: Cat, Dog, Bird, Car" },
            { id: "3", text: "Complete the sentence: The sun is ___" },
          ],
        },
        {
          id: "numerical-ability",
          name: "Numerical Ability",
          questionCount: 20,
          questions: [
            { id: "4", text: "What comes next: 2, 4, 6, 8, ?" },
            { id: "5", text: "If you have 5 apples and eat 2, how many are left?" },
            { id: "6", text: "Which number is bigger: 15 or 12?" },
          ],
        },
        {
          id: "attention-memory",
          name: "Attention & Memory",
          questionCount: 15,
          questions: [
            { id: "7", text: "Remember these colors: Red, Blue, Green. What was the second color?" },
            { id: "8", text: "Count the number of circles in the image" },
          ],
        },
      ],
    },
    {
      id: "middle",
      name: "Middle School",
      classes: "Standards 6-8",
      icon: Users,
      color: "text-green-600",
      sections: [
        {
          id: "logical-reasoning",
          name: "Logical Reasoning",
          questionCount: 30,
          questions: [
            { id: "9", text: "If all roses are flowers and some flowers are red, then..." },
            { id: "10", text: "Complete the pattern: △□○△□?" },
          ],
        },
        {
          id: "personality-assessment",
          name: "Personality Assessment",
          questionCount: 40,
          questions: [
            { id: "11", text: "I enjoy working in groups with other students" },
            { id: "12", text: "I prefer to plan my activities in advance" },
          ],
        },
        {
          id: "interest-exploration",
          name: "Interest Exploration",
          questionCount: 35,
          questions: [
            { id: "13", text: "Which activity interests you most?" },
            { id: "14", text: "I enjoy solving math problems" },
          ],
        },
      ],
    },
    {
      id: "secondary",
      name: "Secondary School",
      classes: "Standards 9-12",
      icon: GraduationCap,
      color: "text-purple-600",
      sections: [
        {
          id: "aptitude-testing",
          name: "Comprehensive Aptitude",
          questionCount: 60,
          questions: [
            { id: "15", text: "Solve: If x + 5 = 12, then x = ?" },
            { id: "16", text: "Choose the word most similar to 'Eloquent'" },
          ],
        },
        {
          id: "career-interests",
          name: "Career Interest Inventory",
          questionCount: 50,
          questions: [
            { id: "17", text: "I would enjoy working as a scientist" },
            { id: "18", text: "Leading a team appeals to me" },
          ],
        },
        {
          id: "emotional-intelligence",
          name: "Emotional Intelligence",
          questionCount: 45,
          questions: [
            { id: "19", text: "When someone is upset, I can usually tell" },
            { id: "20", text: "I handle stress well under pressure" },
          ],
        },
      ],
    },
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const isSelected = (type: string, id?: string, groupId?: string, sectionId?: string) => {
    return (
      safeSelectedItem.type === type &&
      safeSelectedItem.id === id &&
      safeSelectedItem.groupId === groupId &&
      safeSelectedItem.sectionId === sectionId
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {groups.map((group) => (
            <div key={group.id}>
              <Button
                variant={isSelected("group", group.id) ? "secondary" : "ghost"}
                className="w-full justify-start text-sm p-2 h-auto"
                onClick={() => {
                  toggleGroup(group.id)
                  safeOnItemSelect({ type: "group", id: group.id })
                }}
              >
                <div className="flex items-center space-x-2 flex-1">
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <group.icon className={`w-4 h-4 ${group.color}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-gray-500">{group.classes}</div>
                  </div>
                </div>
              </Button>
              {expandedGroups.includes(group.id) && (
                <div className="ml-4 space-y-1 mt-1">
                  {group.sections.map((section) => (
                    <div key={section.id}>
                      <Button
                        variant={isSelected("section", section.id, group.id) ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm p-2 h-auto"
                        onClick={() => {
                          toggleSection(section.id)
                          safeOnItemSelect({ type: "section", id: section.id, groupId: group.id })
                        }}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-xs">{section.name}</div>
                            <Badge variant="outline" className="text-xs h-4 px-1">
                              {section.questionCount} questions
                            </Badge>
                          </div>
                        </div>
                      </Button>
                      {expandedSections.includes(section.id) && (
                        <div className="ml-6 mb-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full text-xs h-7"
                            onClick={() =>
                              safeOnItemSelect({
                                type: "test",
                                id: section.id,
                                groupId: group.id,
                                sectionId: section.id,
                              })
                            }
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Take Test
                          </Button>
                        </div>
                      )}
                      {expandedSections.includes(section.id) && (
                        <div className="ml-6 space-y-1 mt-1">
                          <Button
                            variant={isSelected("questions", "all", group.id, section.id) ? "secondary" : "ghost"}
                            className="w-full justify-start text-xs p-1.5 h-auto"
                            onClick={() =>
                              safeOnItemSelect({
                                type: "questions",
                                id: "all",
                                groupId: group.id,
                                sectionId: section.id,
                              })
                            }
                          >
                            <MessageSquare className="w-3 h-3 mr-2 text-gray-400" />
                            <span>All Questions ({section.questions.length})</span>
                          </Button>
                          {section.questions.slice(0, 3).map((question) => (
                            <Button
                              key={question.id}
                              variant={
                                isSelected("questions", question.id, group.id, section.id) ? "secondary" : "ghost"
                              }
                              className="w-full justify-start text-xs p-1.5 h-auto"
                              onClick={() =>
                                safeOnItemSelect({
                                  type: "questions",
                                  id: question.id,
                                  groupId: group.id,
                                  sectionId: section.id,
                                })
                              }
                            >
                              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 flex-shrink-0" />
                              <span className="truncate">{question.text}</span>
                            </Button>
                          ))}
                          {section.questions.length > 3 && (
                            <div className="text-xs text-gray-500 pl-4">
                              +{section.questions.length - 3} more questions
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
