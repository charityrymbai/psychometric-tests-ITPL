"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Users, BookOpen, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function TestsPage() {
  const params = useParams()
  const group = params.group as string

  // Use numeric group ids for lookup
  const groupData = {
    "1": {
      name: "Primary School",
      classes: "Standards 1-5",
      color: "bg-blue-500",
      tests: [
        {
          id: "verbal-reasoning",
          name: "Verbal Reasoning",
          description: "Word understanding and language skills",
          duration: "15 mins",
          questions: 20,
          sections: ["Word Recognition", "Simple Comprehension"],
          difficulty: "Beginner",
        },
        {
          id: "numerical-ability",
          name: "Numerical Ability",
          description: "Basic math and number concepts",
          duration: "20 mins",
          questions: 25,
          sections: ["Number Patterns", "Simple Calculations"],
          difficulty: "Beginner",
        },
        {
          id: "attention-memory",
          name: "Attention & Memory",
          description: "Focus and recall abilities",
          duration: "12 mins",
          questions: 15,
          sections: ["Visual Memory", "Attention Span"],
          difficulty: "Beginner",
        },
      ],
    },
    "2": {
      name: "Middle School",
      classes: "Standards 6-8",
      color: "bg-green-500",
      tests: [
        {
          id: "logical-reasoning",
          name: "Logical Reasoning",
          description: "Problem-solving and analytical thinking",
          duration: "25 mins",
          questions: 30,
          sections: ["Pattern Recognition", "Logical Sequences", "Analogies"],
          difficulty: "Intermediate",
        },
        {
          id: "personality-assessment",
          name: "Personality Assessment",
          description: "Understanding behavioral tendencies",
          duration: "20 mins",
          questions: 40,
          sections: ["Social Preferences", "Learning Style", "Emotional Responses"],
          difficulty: "Intermediate",
        },
        {
          id: "interest-exploration",
          name: "Interest Exploration",
          description: "Discover areas of natural curiosity",
          duration: "18 mins",
          questions: 35,
          sections: ["Subject Interests", "Activity Preferences", "Career Curiosity"],
          difficulty: "Intermediate",
        },
      ],
    },
    "3": {
      name: "Secondary School",
      classes: "Standards 9-12",
      color: "bg-purple-500",
      tests: [
        {
          id: "aptitude-testing",
          name: "Comprehensive Aptitude",
          description: "Multi-domain ability assessment",
          duration: "45 mins",
          questions: 60,
          sections: ["Verbal", "Quantitative", "Abstract Reasoning", "Spatial"],
          difficulty: "Advanced",
        },
        {
          id: "career-interests",
          name: "Career Interest Inventory",
          description: "Explore potential career paths",
          duration: "30 mins",
          questions: 50,
          sections: ["Work Values", "Interest Areas", "Skill Preferences"],
          difficulty: "Advanced",
        },
        {
          id: "emotional-intelligence",
          name: "Emotional Intelligence",
          description: "Emotional awareness and regulation",
          duration: "25 mins",
          questions: 45,
          sections: ["Self-Awareness", "Social Skills", "Empathy", "Stress Management"],
          difficulty: "Advanced",
        },
      ],
    },
  }

  const currentGroup = groupData[group as keyof typeof groupData]

  if (!currentGroup) {
    return <div>Group not found</div>
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
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Play className="w-4 h-4 mr-2" />
                Take All Tests
              </Button>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Total: ~90 mins
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {currentGroup.tests.length} Tests
                </span>
              </div>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">Complete all tests to get comprehensive insights</p>
          </CardContent>
        </Card>

        {/* Individual Tests */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGroup.tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                </div>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {test.duration}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {test.questions} questions
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Test Sections:</p>
                  <div className="flex flex-wrap gap-1">
                    {test.sections.map((section, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Link href={`/assessment/${test.id}`}>
                  <Button className="w-full">Start Test</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
