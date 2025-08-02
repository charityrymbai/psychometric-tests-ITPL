
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Users, BookOpen, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
}

export default function TestsPage() {

  const params = useParams();
  const group = params.group as string;
  const [sections, setSections] = useState<any[]>([]);
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState<any[]>([]);

  // Fetch all sections on page load
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/sections/${group}`, { method: "GET" })
      .then((response) => response.json())
      .then((result) => {
        setSections(Array.isArray(result) ? result : []);
      })
      .catch((error) => {
        setSections([]);
        console.error("Sections fetch error:", error);
      });
  }, [group]);

  // Fetch current group details
  useEffect(() => {
    async function fetchGroupDetails() {
      setLoading(true);
      try {
        // Fetch all groups
        const res = await fetch(`${BACKEND_BASE_URL}/groups/getAll`);
        const data = await res.json();
        // Find the group by id (params.group)
        const found = data.find((g: any) => String(g.id) === String(group));
        setCurrentGroup(found || null);
      } catch {
        setCurrentGroup(null);
      }
      setLoading(false);
    }
    fetchGroupDetails();
  }, [group]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!currentGroup) {
    return <div>Group not found</div>;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Use fetched sections if available, otherwise fallback to currentGroup.sections
  const displaySections = sections.length > 0 ? sections : (Array.isArray(currentGroup.sections) ? currentGroup.sections : []);

  console.log("Current Group:", currentGroup);

  // Find the current group in allGroups to get its questionCount
  const groupFromAll = allGroups.find((g: any) => String(g.id) === String(group));
  const groupQuestionCount = groupFromAll?.questionCount ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
              <p className="text-sm text-gray-600">{currentGroup.classes}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${currentGroup.color} rounded-lg flex items-center justify-center`}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span>Available Assessments</span>
            </CardTitle>
            <CardDescription>Choose individual tests or take the complete assessment battery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              {displaySections.length > 0 && (
                <Link href={`/assessment/multi/${group}`}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Play className="w-4 h-4 mr-2" />
                    Take All Tests
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {displaySections.length} Sections
                </span>
              </div>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">Complete all tests to get comprehensive insights</p>
          </CardContent>
        </Card>

        {/* All Sections */}
        {sections.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>All Sections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section: any) => (
                  <Card key={section.sectionId} className="hover:shadow transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="text-base">{section.sectionName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {section.questionsCount} questions
                      </div>
                      {section.questionsCount > 0 ? (
                        <Link href={`/assessment/${section.sectionId}`}>
                          <Button className="w-full" size="sm">Start Section</Button>
                        </Link>
                      ) : (
                        <Button className="w-full" size="sm" disabled>Start Section</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
