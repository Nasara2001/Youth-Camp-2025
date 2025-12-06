"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, ChevronDown, ChevronUp, User } from "lucide-react"
import { getCampData, addRoom, deleteRoom } from "@/lib/storage"
import type { Room, Participant } from "@/lib/types"
import { toast } from "sonner"

export default function RoomsTab() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [roomName, setRoomName] = useState("")
  const [roomGender, setRoomGender] = useState<"male" | "female">("male")
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    loadRooms()
  }, [])

  const loadRooms = async () => {
    const data = await getCampData()
    setRooms(data.rooms)
    setParticipants(data.participants)
  }

  const toggleRoomExpansion = (roomId: string) => {
    const newExpanded = new Set(expandedRooms)
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId)
    } else {
      newExpanded.add(roomId)
    }
    setExpandedRooms(newExpanded)
  }

  const getRoomParticipants = (roomId: string): Participant[] => {
    return participants.filter((p) => p.roomId === roomId)
  }

  const handleAddRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name")
      return
    }

    setLoading(true)
    try {
      const newRoom = await addRoom({
        name: roomName.trim(),
        gender: roomGender,
      })
      
      console.log("Room added successfully:", newRoom)
      setRoomName("")
      await loadRooms()
      toast.success("Room added successfully", {
        description: "New participants will be assigned to this room until it catches up with others.",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding room:", error)
      const errorMessage = error?.message || "Unknown error occurred"
      toast.error(`Failed to add room: ${errorMessage}`)
      
      // Check if it's a Firebase permission error
      if (errorMessage.includes("permission") || errorMessage.includes("PERMISSION_DENIED")) {
        toast.error("Permission denied. Please check your Firestore security rules.")
      } else if (errorMessage.includes("not initialized")) {
        toast.error("Firebase not initialized. Please check your Firebase configuration.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id)
      await loadRooms()
      toast.success("Room deleted")
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error("Failed to delete room")
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Room
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Room Name</label>
              <Input
                placeholder="e.g., Room 101"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomName.trim()) {
                    handleAddRoom()
                  }
                }}
                className="h-10"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Type</label>
              <Select value={roomGender} onValueChange={(value: any) => setRoomGender(value)} disabled={loading}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male Room</SelectItem>
                  <SelectItem value="female">Female Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleAddRoom} 
            className="w-full h-10 font-semibold gap-2"
            disabled={loading || !roomName.trim()}
          >
            <Plus className="w-4 h-4" />
            {loading ? "Adding..." : "Add Room"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-border">
          <CardTitle>Rooms List</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No rooms created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-semibold w-12"></TableHead>
                    <TableHead className="font-semibold">Room Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Occupants</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const roomParticipants = getRoomParticipants(room.id)
                    const isExpanded = expandedRooms.has(room.id)
                    return (
                      <>
                        <TableRow key={room.id} className="border-border hover:bg-secondary/30">
                          <TableCell>
                            {roomParticipants.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRoomExpansion(room.id)}
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
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell className="capitalize">{room.gender}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {roomParticipants.length}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRoom(room.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && roomParticipants.length > 0 && (
                          <TableRow key={`${room.id}-participants`} className="bg-secondary/20">
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-4 space-y-2">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Participants in {room.name} ({roomParticipants.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {roomParticipants.map((participant) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
