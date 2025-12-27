"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Trash2, DollarSign, Search } from "lucide-react"
import { getCampData, deleteParticipant, updateParticipant } from "@/lib/storage"
import type { Participant, Room, Group, Community } from "@/lib/types"
import { toast } from "sonner"

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    const data = await getCampData()
    setParticipants(data.participants)
    setRooms(data.rooms)
    setGroups(data.groups)
    setCommunities(data.communities)
  }

  const handleDeleteParticipant = async (id: string) => {
    try {
      await deleteParticipant(id)
      await loadData()
      toast.success("Participant deleted successfully")
    } catch (error: any) {
      console.error("Error deleting participant:", error)
      const errorMessage = error?.message || "Unknown error occurred"
      toast.error(`Failed to delete participant: ${errorMessage}`)
      
      if (errorMessage.includes("permission") || errorMessage.includes("PERMISSION_DENIED")) {
        toast.error("Permission denied. Please check your Firestore security rules.")
      }
    }
  }

  const handleToggleReported = async (participantId: string, currentStatus?: "reported" | "not reported") => {
    try {
      const current = currentStatus || "not reported"
      const newStatus = current === "reported" ? "not reported" : "reported"
      await updateParticipant(participantId, { reported: newStatus })
      await loadData()
      toast.success(`Participant marked as ${newStatus === "reported" ? "reported" : "not reported"}`)
    } catch (error) {
      console.error("Toggle reported error:", error)
      toast.error("Failed to update reported status")
    }
  }

  const getRoomName = (roomId?: string) => {
    return rooms.find((r) => r.id === roomId)?.name || "Not assigned"
  }

  const getGroupName = (groupId?: string) => {
    return groups.find((g) => g.id === groupId)?.name || "Not assigned"
  }

  const getCommunityName = (communityId: string) => {
    return communities.find((c) => c.id === communityId)?.name || communityId
  }

  if (!mounted) return null

  // Filter participants by name or ID
  const filteredParticipants = participants.filter((participant) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    const nameMatch = participant.name.toLowerCase().includes(query)
    const idMatch = participant.id.toLowerCase().includes(query)
    return nameMatch || idMatch
  })

  const stats = {
    total: participants.length,
    male: participants.filter((p) => p.gender === "male").length,
    female: participants.filter((p) => p.gender === "female").length,
    totalFees: participants.reduce((sum, p) => sum + p.registrationFee, 0),
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Male</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{stats.male}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-pink-500/10 to-pink-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Female</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-pink-600">{stats.female}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Registration Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-green-600">
              GHS {stats.totalFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `Average: GHS ${(stats.totalFees / stats.total).toFixed(2)}` : "No participants"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Participants</CardTitle>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No participants registered yet</p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No participants found matching your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Gender</TableHead>
                    <TableHead className="font-semibold">Community</TableHead>
                    <TableHead className="font-semibold">Room</TableHead>
                    <TableHead className="font-semibold">Group</TableHead>
                    <TableHead className="font-semibold">Fee</TableHead>
                    <TableHead className="font-semibold">Reported</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id} className="border-border hover:bg-secondary/30">
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                          {participant.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell className="capitalize">{participant.gender}</TableCell>
                      <TableCell>{getCommunityName(participant.community)}</TableCell>
                      <TableCell>{getRoomName(participant.roomId)}</TableCell>
                      <TableCell>{getGroupName(participant.groupId)}</TableCell>
                      <TableCell>GHS {participant.registrationFee.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Switch
                              checked={(participant.reported || "not reported") === "reported"}
                              onCheckedChange={() => handleToggleReported(participant.id, participant.reported)}
                              className="border-2"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(participant.reported || "not reported") === "reported" ? "Reported" : "Not Reported"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteParticipant(participant.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
