"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageSquare, Wand2 } from "lucide-react"
import Link from "next/link"

export function QuestionManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    section: "",
  })

  const questions = [
    {
      id: "1",
      question: "Which word is most similar in meaning to 'Happy'?",
      type: "MCQ",
      section: "Verbal Reasoning",
      group: "Primary",
    },
    {
      id: "2",
      question: "I enjoy working in groups with other students",
      type: "Likert Scale",
      section: "Social Preferences",
      group: "Middle",
    },
    {
      id: "3",
      question: "What comes next in this pattern: 2, 4, 6, 8, ?",
      type: "MCQ",
      section: "Number Patterns",
      group: "Primary",
    },
  ]

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle question creation
    setIsCreateDialogOpen(false)
    setFormData({
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      section: "",
    })
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Management</h2>
          <p className="text-gray-600">Create questions manually or generate using AI</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
                <DialogDescription>Manually create a new assessment question</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="question">Question Text</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="likert">Likert Scale</option>
                    <option value="scenario">Scenario-based</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>

                {formData.type === "mcq" && (
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {formData.options.length > 2 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addOption}>
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="section">Section</Label>
                  <select
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="verbal-reasoning">Verbal Reasoning</option>
                    <option value="numerical-ability">Numerical Ability</option>
                    <option value="logical-reasoning">Logical Reasoning</option>
                    <option value="personality">Personality Assessment</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Question</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Link href="/ai-questions">
            <Button>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Existing Questions */}
      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
                    <CardDescription>
                      {question.section} • {question.group} School
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{question.type}</Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
