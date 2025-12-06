"use client"

import { useState, useEffect } from "react"
import { getCampData, updateParticipant, deleteParticipant } from "@/lib/storage"
import type { Participant, CampData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit2, Save, X, Users, ChevronDown, ChevronUp, ArrowUpDown, Download } from "lucide-react"
import { toast } from "sonner"

type SortField = "name" | "community" | "group" | "reported" | "gender" | "room" | "none"
type SortOrder = "asc" | "desc"

export default function ParticipantsList() {
  const [campData, setCampData] = useState<CampData | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Participant>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortField>("none")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filters, setFilters] = useState<{
    community: string
    group: string
    room: string
    reported: string
    gender: string
  }>({
    community: "all",
    group: "all",
    room: "all",
    reported: "all",
    gender: "all",
  })

  useEffect(() => {
    const loadData = async () => {
      const data = await getCampData()
      setCampData(data)
    }
    loadData()
  }, [])

  const handleEdit = (participant: Participant) => {
    setEditingId(participant.id)
    setEditFormData({
      name: participant.name,
      gender: participant.gender,
      community: participant.community,
      registrationFee: participant.registrationFee,
    })
  }

  const handleSave = async (participantId: string) => {
    try {
      await updateParticipant(participantId, editFormData)
      const data = await getCampData()
      setCampData(data)
    setEditingId(null)
      toast.success("Participant updated successfully")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update participant")
    }
  }

  const handleDelete = async (participantId: string) => {
    try {
      await deleteParticipant(participantId)
      const data = await getCampData()
      setCampData(data)
      toast.success("Participant deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete participant")
    }
  }

  const handleToggleReported = async (participantId: string, currentStatus?: "reported" | "not reported") => {
    try {
      const current = currentStatus || "not reported"
      const newStatus = current === "reported" ? "not reported" : "reported"
      await updateParticipant(participantId, { reported: newStatus })
      const data = await getCampData()
      setCampData(data)
      toast.success(`Participant marked as ${newStatus === "reported" ? "reported" : "not reported"}`)
    } catch (error) {
      console.error("Toggle reported error:", error)
      toast.error("Failed to update reported status")
    }
  }

  const getRoomName = (roomId?: string): string => {
    if (!campData || !roomId) return "Unassigned"
    const room = campData.rooms.find((r) => r.id === roomId)
    return room?.name || "Unassigned"
  }

  const getGroupName = (groupId?: string): string => {
    if (!campData || !groupId) return "Unassigned"
    const group = campData.groups.find((g) => g.id === groupId)
    return group?.name || "Unassigned"
  }

  const getCommunityName = (communityId: string): string => {
    if (!campData) return communityId
    const community = campData.communities.find((c) => c.id === communityId)
    return community?.name || communityId
  }

  const toggleExpand = (participantId: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId)
    } else {
      newExpanded.add(participantId)
    }
    setExpandedIds(newExpanded)
  }

  const getFilteredAndSortedParticipants = (): Participant[] => {
    if (!campData) {
      return []
    }

    // First, apply filters
    let filtered = campData.participants.filter((participant) => {
      // Filter by community
      if (filters.community !== "all" && participant.community !== filters.community) {
        return false
      }

      // Filter by group
      if (filters.group !== "all" && participant.groupId !== filters.group) {
        return false
      }

      // Filter by room
      if (filters.room !== "all" && participant.roomId !== filters.room) {
        return false
      }

      // Filter by reported status
      if (filters.reported !== "all") {
        const reportedStatus = (participant.reported || "not reported") === "reported" ? "reported" : "not reported"
        if (reportedStatus !== filters.reported) {
          return false
        }
      }

      // Filter by gender
      if (filters.gender !== "all" && participant.gender !== filters.gender) {
        return false
      }

      return true
    })

    // Then, apply sorting
    if (sortBy !== "none") {
      filtered.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortBy) {
          case "name":
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case "community":
            aValue = getCommunityName(a.community).toLowerCase()
            bValue = getCommunityName(b.community).toLowerCase()
            break
          case "group":
            aValue = getGroupName(a.groupId).toLowerCase()
            bValue = getGroupName(b.groupId).toLowerCase()
            break
          case "reported":
            aValue = (a.reported || "not reported") === "reported" ? 1 : 0
            bValue = (b.reported || "not reported") === "reported" ? 1 : 0
            break
          case "gender":
            aValue = a.gender === "male" ? 0 : 1
            bValue = b.gender === "male" ? 0 : 1
            break
          case "room":
            aValue = getRoomName(a.roomId).toLowerCase()
            bValue = getRoomName(b.roomId).toLowerCase()
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const clearFilters = () => {
    setFilters({
      community: "all",
      group: "all",
      room: "all",
      reported: "all",
      gender: "all",
    })
  }

  const hasActiveFilters = () => {
    return (
      filters.community !== "all" ||
      filters.group !== "all" ||
      filters.room !== "all" ||
      filters.reported !== "all" ||
      filters.gender !== "all"
    )
  }

  const handleSortChange = (value: string) => {
    if (value === "none") {
      setSortBy("none")
    } else {
      const [field, order] = value.split("-") as [SortField, SortOrder]
      setSortBy(field)
      setSortOrder(order)
    }
  }

  const handleExportParticipants = () => {
    if (!campData) return

    const participantsToExport = getFilteredAndSortedParticipants()
    
    // Create CSV headers
    const headers = [
      "Participant ID",
      "Name",
      "Gender",
      "Community",
      "Room",
      "Group",
      "Registration Fee (GHS)",
      "Reported Status",
      "Registration Date"
    ]

    // Create CSV rows
    const rows = participantsToExport.map((participant) => {
      const communityName = getCommunityName(participant.community)
      const roomName = getRoomName(participant.roomId)
      const groupName = getGroupName(participant.groupId)
      const reportedStatus = (participant.reported || "not reported") === "reported" ? "Reported" : "Not Reported"
      const registrationDate = new Date(participant.registeredAt).toLocaleDateString()

      return [
        participant.id,
        participant.name,
        participant.gender === "male" ? "Male" : "Female",
        communityName,
        roomName,
        groupName,
        participant.registrationFee.toFixed(2),
        reportedStatus,
        registrationDate
      ]
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().split("T")[0]
    link.setAttribute("href", url)
    link.setAttribute("download", `participants_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${participantsToExport.length} participant(s) to CSV`)
  }

  if (!campData) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4">Loading participants...</p>
      </div>
    )
  }

  if (campData.participants.length === 0) {
    return (
      <Card className="p-16 text-center border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No participants yet</h3>
          <p className="text-muted-foreground">Start by registering the first participant!</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500 px-2 sm:px-4">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              All Participants
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and view all registered campers</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Select
                value={sortBy === "none" ? "none" : `${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sorting</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="community-asc">Community (A-Z)</SelectItem>
                  <SelectItem value="community-desc">Community (Z-A)</SelectItem>
                  <SelectItem value="group-asc">Group (A-Z)</SelectItem>
                  <SelectItem value="group-desc">Group (Z-A)</SelectItem>
                  <SelectItem value="room-asc">Room (A-Z)</SelectItem>
                  <SelectItem value="room-desc">Room (Z-A)</SelectItem>
                  <SelectItem value="gender-asc">Gender (Male First)</SelectItem>
                  <SelectItem value="gender-desc">Gender (Female First)</SelectItem>
                  <SelectItem value="reported-asc">Reported First</SelectItem>
                  <SelectItem value="reported-desc">Not Reported First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportParticipants}
              variant="outline"
              className="h-9 text-xs sm:text-sm gap-2"
              disabled={getFilteredAndSortedParticipants().length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <div className="px-3 sm:px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing: <span className="text-primary font-bold text-base sm:text-lg">{getFilteredAndSortedParticipants().length}</span> / <span className="text-muted-foreground">{campData.participants.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4 border border-border/50 shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">Filters</h3>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Community</label>
                <Select
                  value={filters.community}
                  onValueChange={(value) => setFilters({ ...filters, community: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Communities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Communities</SelectItem>
                    {Array.from(new Map(campData.communities.map(c => [c.id, c])).values()).map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Group</label>
                <Select
                  value={filters.group}
                  onValueChange={(value) => setFilters({ ...filters, group: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {Array.from(new Map(campData.groups.map(g => [g.id, g])).values()).map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Room</label>
                <Select
                  value={filters.room}
                  onValueChange={(value) => setFilters({ ...filters, room: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {Array.from(new Map(campData.rooms.map(r => [r.id, r])).values()).map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Status</label>
                <Select
                  value={filters.reported}
                  onValueChange={(value) => setFilters({ ...filters, reported: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="not reported">Not Reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Gender</label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => setFilters({ ...filters, gender: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {getFilteredAndSortedParticipants().length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="max-w-md mx-auto">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No participants found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {hasActiveFilters() 
                  ? "Try adjusting your filters to see more results" 
                  : "No participants match the current filters"}
              </p>
              {hasActiveFilters() && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs sm:text-sm">
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          getFilteredAndSortedParticipants().map((participant, index) => {
          const isExpanded = expandedIds.has(participant.id)
          const isEditing = editingId === participant.id

          return (
            <Card
              key={participant.id}
              className="border border-border/50 shadow-md overflow-hidden animate-in fade-in-50 slide-in-from-left-4 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Name Row - Always Visible */}
              <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-secondary/20 transition-colors flex items-center justify-between gap-2"
                onClick={() => !isEditing && toggleExpand(participant.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {!isEditing && (
                    <div className="text-muted-foreground flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                  )}
                  {isEditing ? (
                      <Input
                        value={editFormData.name || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        placeholder="Name"
                      className="h-9 flex-1 max-w-xs text-sm sm:text-base"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{participant.name}</h3>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        (participant.reported || "not reported") === "reported"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {(participant.reported || "not reported") === "reported" ? "Reported" : "Not Reported"}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && !isEditing && (
                <div className="border-t border-border/50 p-3 sm:p-4 bg-secondary/10 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* ID */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Participant ID</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        {participant.id}
                      </span>
                    </div>

                    {/* Gender */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Gender</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          participant.gender === "male"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                        }`}
                      >
                        {participant.gender === "male" ? "Male" : "Female"}
                      </span>
                    </div>

                    {/* Community */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Community</p>
                      <p className="text-sm font-medium">{getCommunityName(participant.community)}</p>
                    </div>

                    {/* Room */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Room</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/50 text-foreground border border-border/50">
                        {getRoomName(participant.roomId)}
                      </span>
                    </div>

                    {/* Group */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Group</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/50 text-foreground border border-border/50">
                        {getGroupName(participant.groupId)}
                      </span>
                    </div>

                    {/* Fee */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Registration Fee</p>
                      <p className="text-sm font-bold text-primary">GHS {participant.registrationFee.toFixed(2)}</p>
                    </div>

                    {/* Reported Status */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Reported Status</p>
                      <div 
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          checked={(participant.reported || "not reported") === "reported"}
                          onCheckedChange={() => {
                            handleToggleReported(participant.id, participant.reported)
                          }}
                          className="border-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {(participant.reported || "not reported") === "reported" ? "Reported" : "Not Reported"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(participant)
                      }}
                      className="hover:bg-primary/10 hover:border-primary/50 transition-all text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(participant.id)
                      }}
                      className="hover:shadow-md transition-all text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit Mode */}
              {isEditing && (
                <div className="border-t border-border/50 p-3 sm:p-4 bg-secondary/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                      <select
                        value={editFormData.gender || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            gender: e.target.value as "male" | "female",
                          })
                        }
                        className="w-full h-9 px-3 border border-border rounded-md bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Community</label>
                      <select
                        value={editFormData.community || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                        className="w-full h-9 px-3 border border-border rounded-md bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      >
                        <option value="">Select Community</option>
                        {Array.from(new Map(campData.communities.map(c => [c.id, c])).values()).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Registration Fee</label>
                      <Input
                        type="number"
                        value={editFormData.registrationFee || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            registrationFee: Number.parseFloat(e.target.value),
                          })
                        }
                        placeholder="Fee"
                        className="h-9"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Reported Status</label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={(participant.reported || "not reported") === "reported"}
                          onCheckedChange={() => handleToggleReported(participant.id, participant.reported)}
                          className="border-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {(participant.reported || "not reported") === "reported" ? "Reported" : "Not Reported"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(participant.id)}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save Changes
                      </Button>
                      <Button
                        size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Cancel
                      </Button>
                  </div>
                </div>
              )}
            </Card>
          )
          })
        )}
      </div>
    </div>
  )
}
