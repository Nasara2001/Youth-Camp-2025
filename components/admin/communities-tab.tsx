"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { getCampData, addCommunity, deleteCommunity } from "@/lib/storage"
import type { Community, Participant } from "@/lib/types"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, User } from "lucide-react"

export default function CommunitiesTab() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [communityName, setCommunityName] = useState("")
  const [mounted, setMounted] = useState(false)
  const [expandedCommunities, setExpandedCommunities] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    const data = await getCampData()
    setCommunities(data.communities)
    setParticipants(data.participants)
  }

  const toggleCommunityExpansion = (communityId: string) => {
    const newExpanded = new Set(expandedCommunities)
    if (newExpanded.has(communityId)) {
      newExpanded.delete(communityId)
    } else {
      newExpanded.add(communityId)
    }
    setExpandedCommunities(newExpanded)
  }

  const getCommunityParticipants = (communityId: string): Participant[] => {
    return participants.filter((p) => p.community === communityId)
  }

  const handleAddCommunity = async () => {
    if (!communityName.trim()) {
      toast.error("Please enter a community name")
      return
    }

    try {
      await addCommunity(communityName)
      setCommunityName("")
      await loadCommunities()
      toast.success("Community added successfully")
    } catch (error) {
      console.error("Error adding community:", error)
      toast.error("Failed to add community")
    }
  }

  const handleDeleteCommunity = async (id: string) => {
    try {
      await deleteCommunity(id)
      await loadCommunities()
      toast.success("Community deleted")
    } catch (error) {
      console.error("Error deleting community:", error)
      toast.error("Failed to delete community")
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Community name (e.g., East Side)"
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
          />
          <Button onClick={handleAddCommunity} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Community
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communities List</CardTitle>
        </CardHeader>
        <CardContent>
          {communities.length === 0 ? (
            <p className="text-muted-foreground">No communities created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Community Name</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => {
                  const communityParticipants = getCommunityParticipants(community.id)
                  const isExpanded = expandedCommunities.has(community.id)
                  return (
                    <>
                      <TableRow key={community.id}>
                        <TableCell>
                          {communityParticipants.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCommunityExpansion(community.id)}
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
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {communityParticipants.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCommunity(community.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && communityParticipants.length > 0 && (
                        <TableRow key={`${community.id}-participants`} className="bg-secondary/20">
                          <TableCell colSpan={4} className="p-0">
                            <div className="p-4 space-y-2">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Participants from {community.name} ({communityParticipants.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {communityParticipants.map((participant) => (
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
