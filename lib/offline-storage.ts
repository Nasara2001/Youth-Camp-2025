// Offline storage utility using localStorage as fallback
import type { CampData, Room, Community, Group, Participant } from "./types"

const STORAGE_KEY = "youth-camp-data"
const SYNC_QUEUE_KEY = "youth-camp-sync-queue"

// Check if we're online
export function isOnline(): boolean {
  if (typeof window === "undefined") return false
  return navigator.onLine
}

// Get data from localStorage
export function getLocalData(): CampData {
  if (typeof window === "undefined") {
    return { rooms: [], communities: [], groups: [], participants: [] }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as CampData
      // Ensure all participants have a reported field set to "not reported" by default
      if (data.participants) {
        data.participants = data.participants.map((p) => ({
          ...p,
          reported: (p.reported as "reported" | "not reported") || "not reported",
        }))
      }
      return data
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error)
  }

  return { rooms: [], communities: [], groups: [], participants: [] }
}

// Save data to localStorage
export function saveLocalData(data: CampData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Queue an operation for later sync
export interface QueuedOperation {
  type: "add" | "update" | "delete"
  collection: "rooms" | "communities" | "groups" | "participants"
  id: string
  data?: any
  timestamp: number
}

export function queueOperation(operation: Omit<QueuedOperation, "timestamp">): void {
  if (typeof window === "undefined") return

  try {
    const queue = getSyncQueue()
    
    // Check if this operation already exists in the queue (prevent duplicates)
    const existingIndex = queue.findIndex(
      (op) => op.type === operation.type &&
              op.collection === operation.collection &&
              op.id === operation.id
    )
    
    if (existingIndex >= 0) {
      // Update existing operation instead of adding duplicate
      queue[existingIndex] = {
        ...operation,
        timestamp: Date.now(),
      }
    } else {
      // Add new operation
      queue.push({
        ...operation,
        timestamp: Date.now(),
      })
    }
    
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Error queueing operation:", error)
  }
}

export function getSyncQueue(): QueuedOperation[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error reading sync queue:", error)
  }

  return []
}

export function clearSyncQueue(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SYNC_QUEUE_KEY)
}

// Local storage CRUD operations
export function addRoomLocal(room: Room): void {
  const data = getLocalData()
  data.rooms.push(room)
  saveLocalData(data)
}

export function addCommunityLocal(community: Community): void {
  const data = getLocalData()
  data.communities.push(community)
  saveLocalData(data)
}

export function addGroupLocal(group: Group): void {
  const data = getLocalData()
  data.groups.push(group)
  saveLocalData(data)
}

export function addParticipantLocal(participant: Participant): void {
  const data = getLocalData()
  data.participants.push(participant)
  saveLocalData(data)
}

export function updateParticipantLocal(participantId: string, updates: Partial<Participant>): void {
  const data = getLocalData()
  const index = data.participants.findIndex((p) => p.id === participantId)
  if (index !== -1) {
    data.participants[index] = { ...data.participants[index], ...updates }
    saveLocalData(data)
  }
}

export function deleteRoomLocal(roomId: string): void {
  const data = getLocalData()
  data.rooms = data.rooms.filter((r) => r.id !== roomId)
  saveLocalData(data)
}

export function deleteCommunityLocal(communityId: string): void {
  const data = getLocalData()
  data.communities = data.communities.filter((c) => c.id !== communityId)
  saveLocalData(data)
}

export function deleteGroupLocal(groupId: string): void {
  const data = getLocalData()
  data.groups = data.groups.filter((g) => g.id !== groupId)
  saveLocalData(data)
}

export function deleteParticipantLocal(participantId: string): void {
  const data = getLocalData()
  data.participants = data.participants.filter((p) => p.id !== participantId)
  saveLocalData(data)
}

