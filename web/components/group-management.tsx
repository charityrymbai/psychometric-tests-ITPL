"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface Group {
  id: string
  name: string
  description: string
  startClass: number
  endClass: number
}

export function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "Primary School",
      description: "Foundational assessments for young learners",
      startClass: 1,
      endClass: 5,
    },
    {
      id: "2",
      name: "Middle School",
      description: "Comprehensive evaluations for developing minds",
      startClass: 6,
      endClass: 8,
    },
    {
      id: "3",
      name: "Secondary School",
      description: "Advanced assessments for career guidance",
      startClass: 9,
      endClass: 12,
    },
  ])
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startClass: "",
    endClass: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation for overlapping classes
    const start = Number.parseInt(formData.startClass)
    const end = Number.parseInt(formData.endClass)

    if (start > end) {
      alert("Start class cannot be greater than end class")
      return
    }

    // Check for overlaps with existing groups (excluding current group if editing)
    const hasOverlap = groups.some((group) => {
      if (editingGroup && group.id === editingGroup.id) return false
      return start <= group.endClass && end >= group.startClass
    })

    if (hasOverlap) {
      alert("Class range overlaps with existing group")
      return
    }

    if (editingGroup) {
      // Update existing group
      setGroups(
        groups.map((group) =>
          group.id === editingGroup.id ? { ...group, ...formData, startClass: start, endClass: end } : group,
        ),
      )
    } else {
      // Add new group
      const newGroup: Group = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        startClass: start,
        endClass: end,
      }
      setGroups([...groups, newGroup])
    }

    setIsDialogOpen(false)
    setEditingGroup(null)
    setFormData({ name: "", description: "", startClass: "", endClass: "" })
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      startClass: group.startClass.toString(),
      endClass: group.endClass.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (groupId: string) => {
    if (confirm("Are you sure you want to delete this group?")) {
      setGroups(groups.filter((group) => group.id !== groupId))
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", startClass: "", endClass: "" })
    setEditingGroup(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Management</h2>
          <p className="text-gray-600">Create and manage assessment groups by class levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Group" : "Create New Group"}</DialogTitle>
              <DialogDescription>
                Define the group details and class range. Classes cannot overlap between groups.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Primary School"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the group"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startClass">Start Class</Label>
                  <Select
                    value={formData.startClass}
                    onValueChange={(value) => setFormData({ ...formData, startClass: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Class {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endClass">End Class</Label>
                  <Select
                    value={formData.endClass}
                    onValueChange={(value) => setFormData({ ...formData, endClass: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Class {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingGroup ? "Update" : "Create"} Group</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/tests/${group.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(group)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  Classes {group.startClass} - {group.endClass}
                </Badge>
                <span className="text-sm text-gray-500">{group.endClass - group.startClass + 1} class levels</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
