"use client"

import { useState } from "react"
import { TreeSidebar } from "@/components/tree-sidebar"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, GraduationCap, Brain, Target, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [selectedItem, setSelectedItem] = useState<{
    type: "home" | "group" | "section" | "questions" | "test" | "results"
    id?: string
    groupId?: string
    sectionId?: string
    data?: any
  }>({ type: "home" })

  const groups = [
    {
      id: "primary",
      name: "Primary School",
      description: "Foundational assessments for young learners",
      classes: "Standards 1-5",
      ageRange: "6-11 years",
      icon: BookOpen,
      color: "bg-blue-500",
      assessments: ["Verbal Reasoning", "Numerical Ability", "Attention & Memory", "Basic Personality Traits"],
      totalTests: 8,
    },
    {
      id: "middle",
      name: "Middle School",
      description: "Comprehensive evaluations for developing minds",
      classes: "Standards 6-8",
      ageRange: "11-14 years",
      icon: Users,
      color: "bg-green-500",
      assessments: ["Logical Reasoning", "Personality Assessment", "Interest Exploration", "Emotional Intelligence"],
      totalTests: 12,
    },
    {
      id: "secondary",
      name: "Secondary School",
      description: "Advanced assessments for career guidance",
      classes: "Standards 9-12",
      ageRange: "14-18 years",
      icon: GraduationCap,
      color: "bg-purple-500",
      assessments: [
        "Aptitude Testing",
        "Career Interests",
        "Learning Styles",
        "Advanced Personality",
        "Emotional Intelligence",
      ],
      totalTests: 15,
    },
  ]

  const features = [
    {
      icon: Brain,
      title: "Cognitive Assessment",
      description: "Comprehensive evaluation of thinking abilities",
    },
    {
      icon: Target,
      title: "Aptitude Testing",
      description: "Identify strengths and potential career paths",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Understand emotional awareness and regulation",
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <MainContent selectedItem={selectedItem} onItemSelect={setSelectedItem}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">PsychoMetric Pro</h1>
                    <p className="text-sm text-gray-600">Student Assessment Platform</p>
                  </div>
                </div>
                <Link href="/settings">
                  <Button variant="outline">Settings</Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Potential</h2>
              <p className="text-xl text-gray-600 mb-8">
                Interactive psychometric assessments designed for Indian school students from Standards 1-12
              </p>


              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Choose Your Assessment Level</h3>

              <div className="grid md:grid-cols-3 gap-8">
                {groups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
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
                      <CardDescription className="text-base">{group.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Age Range:</strong> {group.ageRange}
                        </p>
                        <p>
                          <strong>Total Tests:</strong> {group.totalTests}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Assessment Areas:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.assessments.map((assessment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {assessment}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Link href={`/tests/${group.id}`} className="block">
                        <Button className="w-full mt-4" size="lg">
                          Start Assessment
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-50 border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p className="mb-2">Aligned with NCERT, CBSE, and international assessment standards</p>
                <p className="text-sm">Confidential • Age-appropriate • Actionable insights</p>
              </div>
            </div>
          </footer>
        </div>
      </MainContent>
    </div>
  )
}
