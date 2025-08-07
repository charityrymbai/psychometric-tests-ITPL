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
    <div className="p-4 sm:p-6 md:p-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Discover Your Potential</h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
          Interactive psychometric assessments designed for Indian school students from Standards 1-12
        </p>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {groups.map((group: any) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${group.color} rounded-lg flex items-center justify-center`}>
                  <group.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">{group.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {group.classes}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 sm:mb-4">{group.description}</p>
              <div className="text-sm text-gray-600 mb-3 sm:mb-4">
                <p>
                  <strong>Total Tests:</strong> {group.totalTests}
                </p>
              </div>
              <Button 
                className="w-full py-5 text-base" 
                onClick={() => router.push(`/groups/${group.id}`)}
              >
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
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 ${group.color} rounded-lg flex items-center justify-center`}>
              <group.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">
                {group.classes} • {group.ageRange}
              </p>
            </div>
          </div>
          <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">{group.description}</p>

          {/* Take All Tests Button */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Complete Assessment Battery</h3>
                  <p className="text-gray-600 mb-3 sm:mb-4">Take all tests in this group for comprehensive insights</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Total: ~90 mins
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {group.sections?.length || 0} Sections
                    </span>
                  </div>
                </div>
                <Button size="lg" className="w-full sm:w-auto py-5 text-base bg-gradient-to-r from-blue-500 to-purple-500">
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Individual Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {group.sections?.map((section: any) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
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
                    className="w-full py-5 text-base"
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
    );
  };

  // Section View
  const renderSectionView = () => {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 sm:mb-8 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Verbal Reasoning</CardTitle>
                  <CardDescription>Assess verbal comprehension and language skills</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1">
                  Language Skills
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Cognitive Assessment
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  30 Questions
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  45 Minutes
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="mb-6 sm:mb-8">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 mb-4">
                  This section evaluates the student's ability to understand and process language, including vocabulary, relationships between words, and verbal reasoning skills. It's designed to assess how well students can interpret and manipulate verbal information.
                </p>
                <h3 className="font-semibold mb-2">Skills Assessed</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Vocabulary</Badge>
                  <Badge>Word Relationships</Badge>
                  <Badge>Verbal Analogies</Badge>
                  <Badge>Comprehension</Badge>
                  <Badge>Language Logic</Badge>
                </div>
              </div>
              <Button 
                className="w-full sm:w-auto py-5 text-base" 
                onClick={() =>
                  onItemSelect({
                    type: "test",
                    id: selectedItem.id,
                    groupId: selectedItem.group,
                    sectionId: selectedItem.id,
                  })
                }
              >
                <Play className="w-4 h-4 mr-2" />
                Start Test
              </Button>
            </CardContent>
          </Card>

          {/* Previous Results */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Previous Results</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-center text-gray-600 p-8">
                <Heart className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <p>You haven't taken this test yet.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Test Interface
  const renderTestInterface = () => {
    return (
      <TestInterface
          groupId={selectedItem.group || ""}
        sectionId={selectedItem.sectionId || ""}
        onTestComplete={(results) => {
          onItemSelect({
            type: "results",
            data: results,
          });
        }}
        onItemSelect={onItemSelect}
      />
    );
  };

  // Test Results
  const renderTestResults = () => {
    return <TestResults results={selectedItem.data} onItemSelect={onItemSelect} />;
  };

  // Render the appropriate content based on the selected item type
  switch (selectedItem.type) {
    case "home":
      return renderDashboard();
    case "group":
      return renderGroupView();
    case "section":
      return renderSectionView();
    case "test":
      return renderTestInterface();
    case "results":
      return renderTestResults();
    default:
      return <div>Select an item from the sidebar</div>;
  }
}
