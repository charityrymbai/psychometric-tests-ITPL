
"use client"
import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Users,
  GraduationCap,
  Brain,
  Target,
  Heart,
  Play,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

import { useRouter } from "next/navigation"
import { TestResults } from "./test-results"
import { TestInterface } from "./test-interface"




interface MainContentProps {
  selectedItem: {
    type: "home" | "group" | "section" | "questions" | "settings" | "test" | "results"
    id?: string
      group?: string
    sectionId?: string
    data?: any
  }
  onItemSelect: (item: any) => void
  children?: React.ReactNode
}

export function MainContent({ selectedItem, onItemSelect }: MainContentProps) {
  const router = useRouter();
  // Map icon names to Lucide icons
  const iconMap = {
    BookOpen,
    Users,
    GraduationCap,
  };

  const [groups, setGroups] = useState<any[]>([]);
  useEffect(() => {
    async function fetchGroups() {
      try {
        // Fetch groups only
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/groups/getAll`);
        const data = await res.json();
        const groupsWithMeta = data.map((g: any, idx: number) => ({
          ...g,
          icon: BookOpen,
          color: ["bg-blue-500", "bg-green-500", "bg-purple-500"][idx % 3],
          classes: g.starting_class && g.ending_class ? `Standards ${g.starting_class}-${g.ending_class}` : undefined,
          totalTests: g.sectionCount
        }));
        setGroups(groupsWithMeta);
      } catch {
        setGroups([]);
      }
    }
    fetchGroups();
  }, []);

  // Dashboard
  const renderDashboard = () => (
    <div className="p-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Potential</h1>
        <p className="text-xl text-gray-600 mb-8">
          Interactive psychometric assessments designed for Indian school students from Standards 1-12
        </p>
      </div>
      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {groups.map((group: any) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 ${group.color} rounded-lg flex items-center justify-center`}>
                  <group.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {group.classes}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              <div className="text-sm text-gray-600 mb-4">
                <p>
                  <strong>Total Tests:</strong> {group.totalTests}
                </p>
              </div>
              <Button className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
                Explore Assessments
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Group View
  const renderGroupView = () => {
    const group = groups.find((g: any) => g.id === selectedItem.id);
    if (!group) return <div>Group not found</div>;

    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 ${group.color} rounded-lg flex items-center justify-center`}>
              <group.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">
                {group.classes} • {group.ageRange}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-700 mb-6">{group.description}</p>

          {/* Take All Tests Button */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Assessment Battery</h3>
                  <p className="text-gray-600 mb-4">Take all tests in this group for comprehensive insights</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Total: ~90 mins
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {group.sections.length} Sections
                    </span>
                  </div>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Play className="w-4 h-4 mr-2" />
                  Start All Tests
                </Button>
              </div>
              <Progress value={0} className="h-2 mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Individual Sections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Individual Sections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.sections.map((section: any) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {section.duration}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {section.questions} questions
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      onItemSelect({
                        type: "section",
                        id: section.id,
                          group: group.id,
                      })
                    }
                  >
                    View Section
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSectionView = () => {
    const group = groups.find((g: any) => g.id === selectedItem.group);
    const section = group?.sections.find((s: any) => s.id === selectedItem.id);

    if (!group || !section) return <div>Section not found</div>

    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>{group.name}</span>
            <span>•</span>
            <span>{section.name}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{section.name}</h1>
          <p className="text-lg text-gray-700 mb-6">{section.description}</p>

          {/* Section Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{section.duration}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{section.questions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{group.classes}</div>
                <div className="text-sm text-gray-600">Target Group</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={() =>
                onItemSelect({
                  type: "test",
                    group: group.id,
                  sectionId: section.id,
                })
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderQuestionsView = () => {
    const group = groups.find((g: any) => g.id === selectedItem.group);
    const section = group?.sections.find((s: any) => s.id === selectedItem.sectionId);

    if (!group || !section) return <div>Questions not found</div>

    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{group.name}</span>
                <span>•</span>
                <span>{section.name}</span>
                <span>•</span>
                <span>Questions</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
              <p className="text-gray-600">Manage questions for {section.name}</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {section.questionList?.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge variant="secondary">{question.type}</Badge>
                    </div>
                    <p className="text-gray-900 mb-4">{question.text}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderSettings = () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Group Management
            </CardTitle>
            <CardDescription>Create and manage assessment groups</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Section Management
            </CardTitle>
            <CardDescription>Manage test sections and categories</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Question Generator
            </CardTitle>
            <CardDescription>Generate questions using AI</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderTestInterface = () => {
    return (
      <TestInterface
          groupId={selectedItem.group!}
        sectionId={selectedItem.sectionId!}
        onTestComplete={(results: any) => {
          // Handle test completion
          onItemSelect({ type: "results", data: results })
        }}
        onItemSelect={onItemSelect}
      />
    )
  }

  const renderTestResults = () => {
    return <TestResults results={selectedItem.data} onItemSelect={onItemSelect} />
  }

  // Render content based on selected item
  switch (selectedItem.type) {
    case "home":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderDashboard()}
        </div>
      )
    case "group":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderGroupView()}
        </div>
      )
    case "section":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderSectionView()}
        </div>
      )
    case "questions":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderQuestionsView()}
        </div>
      )
    case "test":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderTestInterface()}
        </div>
      )
    case "results":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderTestResults()}
        </div>
      )
    case "settings":
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderSettings()}
        </div>
      )
    default:
      return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderDashboard()}
        </div>
      )
  }

}