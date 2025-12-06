// Hybrid storage management - Firebase with localStorage fallback
import * as firebaseDb from "./firebase/db"
import * as offlineStorage from "./offline-storage"
import type { CampData, Room, Community, Group, Participant } from "./types"

// Helper to check if we should use Firebase
async function shouldUseFirebase(): Promise<boolean> {
  // Check if online and Firebase is available
  if (!offlineStorage.isOnline()) {
    return false
  }
  
  // Try to check if Firebase is initialized
  try {
    const { db } = await import("./firebase/config")
    return !!db
  } catch {
    return false
  }
}

// Get all camp data
export async function getCampData(): Promise<CampData> {
  try {
    if (await shouldUseFirebase()) {
      try {
        const data = await firebaseDb.getCampData()
        // Also save to localStorage as backup
        offlineStorage.saveLocalData(data)
        return data
      } catch (error) {
        console.warn("Firebase fetch failed, using local storage:", error)
        // Fall through to localStorage
      }
    }
    
    // Use localStorage fallback
    return offlineStorage.getLocalData()
  } catch (error) {
    console.error("Error getting camp data:", error)
    return offlineStorage.getLocalData()
  }
}

// Add a room
export async function addRoom(room: Omit<Room, "id" | "occupants">): Promise<Room> {
  const newRoom: Room = {
    ...room,
    id: Date.now().toString(),
    occupants: [],
  }

  try {
    if (await shouldUseFirebase()) {
      try {
        const result = await firebaseDb.addRoom(room)
        // Update local storage
        offlineStorage.addRoomLocal(result)
        return result
      } catch (error) {
        console.warn("Firebase add room failed, using local storage:", error)
        // Queue for sync and use local storage
        offlineStorage.queueOperation({
          type: "add",
          collection: "rooms",
          id: newRoom.id,
          data: newRoom,
        })
      }
    } else {
      // Queue for sync when online
      offlineStorage.queueOperation({
        type: "add",
        collection: "rooms",
        id: newRoom.id,
        data: newRoom,
      })
    }
  } catch (error) {
    console.error("Error adding room:", error)
  }

  // Save to local storage
  offlineStorage.addRoomLocal(newRoom)
  return newRoom
}

// Add a community
export async function addCommunity(name: string): Promise<Community> {
  const newCommunity: Community = {
    id: Date.now().toString(),
    name,
  }

  try {
    if (await shouldUseFirebase()) {
      try {
        const result = await firebaseDb.addCommunity(name)
        offlineStorage.addCommunityLocal(result)
        return result
      } catch (error) {
        console.warn("Firebase add community failed, using local storage:", error)
        offlineStorage.queueOperation({
          type: "add",
          collection: "communities",
          id: newCommunity.id,
          data: newCommunity,
        })
      }
    } else {
      offlineStorage.queueOperation({
        type: "add",
        collection: "communities",
        id: newCommunity.id,
        data: newCommunity,
      })
    }
  } catch (error) {
    console.error("Error adding community:", error)
  }

  offlineStorage.addCommunityLocal(newCommunity)
  return newCommunity
}

// Add a group
export async function addGroup(name: string): Promise<Group> {
  const newGroup: Group = {
    id: Date.now().toString(),
    name,
    members: [],
  }

  try {
    if (await shouldUseFirebase()) {
      try {
        const result = await firebaseDb.addGroup(name)
        offlineStorage.addGroupLocal(result)
        return result
      } catch (error) {
        console.warn("Firebase add group failed, using local storage:", error)
        offlineStorage.queueOperation({
          type: "add",
          collection: "groups",
          id: newGroup.id,
          data: newGroup,
        })
      }
    } else {
      offlineStorage.queueOperation({
        type: "add",
        collection: "groups",
        id: newGroup.id,
        data: newGroup,
      })
    }
  } catch (error) {
    console.error("Error adding group:", error)
  }

  offlineStorage.addGroupLocal(newGroup)
  return newGroup
}

// Add a participant
export async function addParticipant(
  participant: Omit<Participant, "id" | "roomId" | "groupId" | "registeredAt">,
): Promise<Participant> {
  try {
    if (await shouldUseFirebase()) {
      try {
        const result = await firebaseDb.addParticipant(participant)
        offlineStorage.addParticipantLocal(result)
        return result
      } catch (error) {
        console.warn("Firebase add participant failed, using local storage:", error)
        // Fall through to local storage
      }
    }
  } catch (error) {
    console.error("Error adding participant:", error)
  }

  // Fallback to local storage with basic assignment
  const localData = offlineStorage.getLocalData()
  
  // Simple room assignment (gender-based)
  const genderRooms = localData.rooms.filter((r) => r.gender === participant.gender)
  let roomId: string | undefined
  if (genderRooms.length > 0) {
    const leastFilledRoom = genderRooms.reduce((prev, current) =>
      prev.occupants.length < current.occupants.length ? prev : current,
    )
    roomId = leastFilledRoom.id
  }

  // Simple group assignment (completely random, independent of room assignment)
  let groupId: string | undefined
  if (localData.groups.length > 0) {
    // Completely random selection from all groups
    const randomIndex = Math.floor(Math.random() * localData.groups.length)
    const randomGroup = localData.groups[randomIndex]
    groupId = randomGroup.id
  }

  // Generate simple ID
  const roomInitial = roomId ? localData.rooms.find((r) => r.id === roomId)?.name.charAt(0).toUpperCase() || "X" : "X"
  const groupNumber = groupId ? localData.groups.find((g) => g.id === groupId)?.name.match(/\d+/)?.[0] || "0" : "0"
  const randomDigits = Math.floor(100 + Math.random() * 900).toString()
  const participantId = `${roomInitial}${groupNumber}${randomDigits}`

  // Ensure reported field is always set to "not reported" by default
  const newParticipant: Participant = {
    ...participant,
    id: participantId,
    roomId,
    groupId,
    registeredAt: new Date().toISOString(),
    reported: (participant.reported as "reported" | "not reported") || "not reported",
  }
  
  // Explicitly set to "not reported" if not provided or invalid
  if (!newParticipant.reported || (newParticipant.reported !== "reported" && newParticipant.reported !== "not reported")) {
    newParticipant.reported = "not reported"
  }

  offlineStorage.addParticipantLocal(newParticipant)
  
  // Queue for sync
  offlineStorage.queueOperation({
    type: "add",
    collection: "participants",
    id: participantId,
    data: newParticipant,
  })

  return newParticipant
}

// Delete a room
export async function deleteRoom(roomId: string): Promise<void> {
  try {
    if (await shouldUseFirebase()) {
      try {
        await firebaseDb.deleteRoom(roomId)
        offlineStorage.deleteRoomLocal(roomId)
        return
      } catch (error) {
        console.warn("Firebase delete room failed, using local storage:", error)
      }
    }
  } catch (error) {
    console.error("Error deleting room:", error)
  }

  offlineStorage.deleteRoomLocal(roomId)
  offlineStorage.queueOperation({
    type: "delete",
    collection: "rooms",
    id: roomId,
  })
}

// Delete a community
export async function deleteCommunity(communityId: string): Promise<void> {
  try {
    if (await shouldUseFirebase()) {
      try {
        await firebaseDb.deleteCommunity(communityId)
        offlineStorage.deleteCommunityLocal(communityId)
        return
      } catch (error) {
        console.warn("Firebase delete community failed, using local storage:", error)
      }
    }
  } catch (error) {
    console.error("Error deleting community:", error)
  }

  offlineStorage.deleteCommunityLocal(communityId)
  offlineStorage.queueOperation({
    type: "delete",
    collection: "communities",
    id: communityId,
  })
}

// Delete a group
export async function deleteGroup(groupId: string): Promise<void> {
  try {
    if (await shouldUseFirebase()) {
      try {
        await firebaseDb.deleteGroup(groupId)
        offlineStorage.deleteGroupLocal(groupId)
        return
      } catch (error) {
        console.warn("Firebase delete group failed, using local storage:", error)
      }
    }
  } catch (error) {
    console.error("Error deleting group:", error)
  }

  offlineStorage.deleteGroupLocal(groupId)
  offlineStorage.queueOperation({
    type: "delete",
    collection: "groups",
    id: groupId,
  })
}

// Delete a participant
export async function deleteParticipant(participantId: string): Promise<void> {
  try {
    if (await shouldUseFirebase()) {
      try {
        await firebaseDb.deleteParticipant(participantId)
        offlineStorage.deleteParticipantLocal(participantId)
        return
      } catch (error) {
        console.warn("Firebase delete participant failed, using local storage:", error)
      }
    }
  } catch (error) {
    console.error("Error deleting participant:", error)
  }

  offlineStorage.deleteParticipantLocal(participantId)
  offlineStorage.queueOperation({
    type: "delete",
    collection: "participants",
    id: participantId,
  })
}

// Update a participant
export async function updateParticipant(
  participantId: string,
  updates: Partial<Omit<Participant, "id" | "registeredAt">>,
): Promise<Participant | null> {
  try {
    if (await shouldUseFirebase()) {
      try {
        const result = await firebaseDb.updateParticipant(participantId, updates)
        if (result) {
          offlineStorage.updateParticipantLocal(participantId, updates)
        }
        return result
      } catch (error) {
        console.warn("Firebase update participant failed, using local storage:", error)
      }
    }
  } catch (error) {
    console.error("Error updating participant:", error)
  }

  // Update in local storage
  offlineStorage.updateParticipantLocal(participantId, updates)
  const localData = offlineStorage.getLocalData()
  const participant = localData.participants.find((p) => p.id === participantId)
  
  // Queue for sync
  if (participant) {
    offlineStorage.queueOperation({
      type: "update",
      collection: "participants",
      id: participantId,
      data: { ...participant, ...updates },
    })
  }

  return participant || null
}
