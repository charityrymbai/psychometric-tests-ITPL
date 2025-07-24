"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FileText } from "lucide-react"

interface Section {
  id: string
  name: string
  displayName: string
  group: string
}

export function SectionManagement() {
  const [sections, setSections] = useState<Section[]>([
    { id: "1", name: "verbal-reasoning", displayName: "Verbal Reasoning", group: "Primary" },
    { id: "2", name: "numerical-ability", displayName: "Numerical Ability", group: "Primary" },
    { id: "3", name: "logical-reasoning", displayName: "Logical Reasoning", group: "Middle" },
    { id: "4", name: "aptitude-testing", displayName: "Comprehensive Aptitude", group: "Secondary" },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    group: "",
  })

  const groups = ["Primary", "Middle", "Secondary"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSection) {
      setSections(sections.map((section) => (section.id === editingSection.id ? { ...section, ...formData } : section)))
    } else {
      const newSection: Section = {
        id: Date.now().toString(),
        ...formData,
      }
      setSections([...sections, newSection])
    }

    setIsDialogOpen(false)
    setEditingSection(null)
    setFormData({ name: "", displayName: "", group: "" })
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      displayName: section.displayName,
      group: section.group,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (sectionId: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setSections(sections.filter((section) => section.id !== sectionId))
    }
  }

  const resetForm = () => {
    setFormData({ name: "", displayName: "", group: "" })
    setEditingSection(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Section Management</h2>
          <p className="text-gray-600">Create and manage test sections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Edit Section" : "Create New Section"}</DialogTitle>
              <DialogDescription>Define the section name and display name for reports.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Section Name (Internal)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., verbal-reasoning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name (Reports)</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Verbal Reasoning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="group">Group</Label>
                <select
                  id="group"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingSection ? "Update" : "Create"} Section</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>{section.displayName}</CardTitle>
                    <CardDescription>Internal name: {section.name}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{section.group} School</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
