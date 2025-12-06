"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { getCampData, addGroup, deleteGroup } from "@/lib/storage"
import type { Group, Participant } from "@/lib/types"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, User } from "lucide-react"

export default function GroupsTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [groupName, setGroupName] = useState("")
  const [mounted, setMounted] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    loadGroups()
  }, [])

  const loadGroups = async () => {
    const data = await getCampData()
    setGroups(data.groups)
    setParticipants(data.participants)
  }

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const getGroupParticipants = (groupId: string): Participant[] => {
    return participants.filter((p) => p.groupId === groupId)
  }

  const handleAddGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name")
      return
    }

    try {
      await addGroup(groupName)
      setGroupName("")
      await loadGroups()
      toast.success("Group added successfully")
    } catch (error) {
      console.error("Error adding group:", error)
      toast.error("Failed to add group")
    }
  }

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id)
      await loadGroups()
      toast.success("Group deleted")
    } catch (error) {
      console.error("Error deleting group:", error)
      toast.error("Failed to delete group")
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Group name (e.g., Red Team)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Button onClick={handleAddGroup} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groups List</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-muted-foreground">No groups created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const groupParticipants = getGroupParticipants(group.id)
                  const isExpanded = expandedGroups.has(group.id)
                  return (
                    <>
                      <TableRow key={group.id}>
                        <TableCell>
                          {groupParticipants.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleGroupExpansion(group.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {groupParticipants.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && groupParticipants.length > 0 && (
                        <TableRow key={`${group.id}-participants`} className="bg-secondary/20">
                          <TableCell colSpan={4} className="p-0">
                            <div className="p-4 space-y-2">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Members of {group.name} ({groupParticipants.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {groupParticipants.map((participant) => (
                                  <div
                                    key={participant.id}
                                    className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/50"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{participant.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ID: <span className="font-mono">{participant.id}</span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
