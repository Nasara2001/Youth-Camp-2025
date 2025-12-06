// Firebase Firestore database operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  runTransaction,
} from "firebase/firestore"
import { db } from "./config"
import type { CampData, Room, Community, Group, Participant } from "../types"

const COLLECTIONS = {
  ROOMS: "rooms",
  COMMUNITIES: "communities",
  GROUPS: "groups",
  PARTICIPANTS: "participants",
} as const

// Helper to convert Firestore timestamp to ISO string
const toISOString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Helper to convert data for Firestore
const prepareForFirestore = (data: any) => {
  const prepared = { ...data }
  if (prepared.registeredAt && typeof prepared.registeredAt === "string") {
    prepared.registeredAt = Timestamp.fromDate(new Date(prepared.registeredAt))
  }
  return prepared
}

// Get all camp data
export async function getCampData(): Promise<CampData> {
  if (!db) {
    console.warn("Firestore not initialized. Returning empty data.")
    return { rooms: [], communities: [], groups: [], participants: [] }
  }
  
  try {
    const [roomsSnapshot, communitiesSnapshot, groupsSnapshot, participantsSnapshot] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.ROOMS), orderBy("name"))),
      getDocs(query(collection(db, COLLECTIONS.COMMUNITIES), orderBy("name"))),
      getDocs(query(collection(db, COLLECTIONS.GROUPS), orderBy("name"))),
      getDocs(query(collection(db, COLLECTIONS.PARTICIPANTS), orderBy("registeredAt", "desc"))),
    ])

    const rooms: Room[] = []
    roomsSnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as Room)
    })

    const communities: Community[] = []
    communitiesSnapshot.forEach((doc) => {
      communities.push({ id: doc.id, ...doc.data() } as Community)
    })

    const groups: Group[] = []
    groupsSnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as Group)
    })

    const participants: Participant[] = []
    participantsSnapshot.forEach((doc) => {
      const data = doc.data()
      participants.push({
        id: doc.id,
        ...data,
        registeredAt: toISOString(data.registeredAt),
        reported: (data.reported as "reported" | "not reported") || "not reported",
      } as Participant)
    })

    return { rooms, communities, groups, participants }
  } catch (error) {
    console.error("Error fetching camp data:", error)
    return { rooms: [], communities: [], groups: [], participants: [] }
  }
}

// Add a room
export async function addRoom(room: Omit<Room, "id" | "occupants">): Promise<Room> {
  if (!db) {
    throw new Error("Firestore not initialized. Make sure Firebase is configured correctly.")
  }
  
  try {
    const newRoom: Omit<Room, "id"> = {
      ...room,
      occupants: [],
    }
    const docRef = doc(collection(db, COLLECTIONS.ROOMS))
    console.log("Adding room to Firestore:", newRoom)
    await setDoc(docRef, newRoom)
    console.log("Room added with ID:", docRef.id)
    return { id: docRef.id, ...newRoom }
  } catch (error: any) {
    console.error("Firestore error adding room:", error)
    if (error?.code === "permission-denied" || error?.code === "PERMISSION_DENIED") {
      throw new Error("Permission denied. Please check your Firestore security rules allow writes to the 'rooms' collection.")
    }
    throw new Error(`Failed to add room: ${error?.message || "Unknown error"}`)
  }
}

// Add a community
export async function addCommunity(name: string): Promise<Community> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  const newCommunity: Omit<Community, "id"> = { name }
  const docRef = doc(collection(db, COLLECTIONS.COMMUNITIES))
  await setDoc(docRef, newCommunity)
  return { id: docRef.id, ...newCommunity }
}

// Add a group
export async function addGroup(name: string): Promise<Group> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  const newGroup: Omit<Group, "id"> = {
    name,
    members: [],
  }
  const docRef = doc(collection(db, COLLECTIONS.GROUPS))
  await setDoc(docRef, newGroup)
  return { id: docRef.id, ...newGroup }
}

// Add a participant
export async function addParticipant(
  participant: Omit<Participant, "id" | "roomId" | "groupId" | "registeredAt">,
): Promise<Participant> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  // First, get all rooms and groups to determine assignments
  const [roomsSnapshot, groupsSnapshot] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.ROOMS))),
    getDocs(query(collection(db, COLLECTIONS.GROUPS))),
  ])

  const rooms: Room[] = []
  roomsSnapshot.forEach((doc) => {
    rooms.push({ id: doc.id, ...doc.data() } as Room)
  })

  const groups: Group[] = []
  groupsSnapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() } as Group)
  })

  // Ensure reported field is always set to "not reported" by default
  const newParticipant: Omit<Participant, "id"> = {
    ...participant,
    registeredAt: new Date().toISOString(),
    reported: (participant.reported as "reported" | "not reported") || "not reported",
  }
  
  // Explicitly set to "not reported" if not provided
  if (!newParticipant.reported || (newParticipant.reported !== "reported" && newParticipant.reported !== "not reported")) {
    newParticipant.reported = "not reported"
  }

  // Find and assign to appropriate room (based on gender)
  // Priority: Assign to rooms that are behind until they catch up, then distribute evenly
  const genderRooms = rooms.filter((r) => r.gender === participant.gender)
  if (genderRooms.length > 0) {
    // Find the average number of occupants (to determine which rooms are "behind")
    const totalOccupants = genderRooms.reduce((sum, room) => sum + room.occupants.length, 0)
    const averageOccupants = totalOccupants / genderRooms.length
    
    // Find rooms that are below average (behind)
    const behindRooms = genderRooms.filter((r) => r.occupants.length < averageOccupants)
    
    let selectedRoom: Room
    
    if (behindRooms.length > 0) {
      // If there are rooms behind, assign to the one with the fewest occupants
      selectedRoom = behindRooms.reduce((prev, current) =>
        prev.occupants.length < current.occupants.length ? prev : current,
      )
    } else {
      // If all rooms are caught up, assign to the one with the fewest occupants (even distribution)
      selectedRoom = genderRooms.reduce((prev, current) =>
        prev.occupants.length < current.occupants.length ? prev : current,
      )
    }
    
    newParticipant.roomId = selectedRoom.id
  }

  // Find and assign to group (completely random, independent of room assignment)
  let selectedGroup: Group | undefined
  if (groups.length > 0) {
    // Completely random selection from all groups
    const randomIndex = Math.floor(Math.random() * groups.length)
    selectedGroup = groups[randomIndex]
    newParticipant.groupId = selectedGroup.id
  }

  const selectedRoom = rooms.find((r) => r.id === newParticipant.roomId)

  // Helper function to generate ID format (without checking uniqueness)
  const generateIdFormat = (room: Room | undefined, group: Group | undefined): string => {
    // Get room initial (first letter of room name, uppercase)
    const roomInitial = room?.name ? room.name.charAt(0).toUpperCase() : "X"
    
    // Extract group number from group name (look for numbers in the name)
    let groupNumber = "0"
    if (group?.name) {
      const numberMatch = group.name.match(/\d+/)
      if (numberMatch) {
        groupNumber = numberMatch[0]
      } else {
        // If no number found, use group index or a default
        const groupIndex = groups.findIndex((g) => g.id === group.id)
        groupNumber = (groupIndex + 1).toString()
      }
    }
    
    // Generate 3 random digits
    const randomDigits = Math.floor(100 + Math.random() * 900).toString() // 100-999
    
    // Combine: RoomInitial + GroupNumber + RandomDigits
    return `${roomInitial}${groupNumber}${randomDigits}`
  }

  // Use transaction to ensure atomicity - ALL READS FIRST, THEN ALL WRITES
  return runTransaction(db, async (transaction) => {
    // STEP 1: ALL READS FIRST
    // Generate and check participant ID uniqueness
    let participantId: string
    let attempts = 0
    while (attempts < 10) {
      participantId = generateIdFormat(selectedRoom, selectedGroup)
      const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId)
      const existingDoc = await transaction.get(participantRef)
      if (!existingDoc.exists()) {
        break // ID is unique
      }
      attempts++
    }
    
    if (attempts >= 10) {
      throw new Error("Failed to generate unique participant ID after 10 attempts")
    }

    // Read room document if assigned
    let roomData: Room | null = null
    if (newParticipant.roomId) {
      const roomRef = doc(db, COLLECTIONS.ROOMS, newParticipant.roomId)
      const roomDoc = await transaction.get(roomRef)
      if (roomDoc.exists()) {
        roomData = roomDoc.data() as Room
      }
    }

    // Read group document if assigned
    let groupData: Group | null = null
    if (newParticipant.groupId) {
      const groupRef = doc(db, COLLECTIONS.GROUPS, newParticipant.groupId)
      const groupDoc = await transaction.get(groupRef)
      if (groupDoc.exists()) {
        groupData = groupDoc.data() as Group
      }
    }

    // STEP 2: ALL WRITES AFTER READS
    // Create participant with custom ID
    const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId!)
    const participantData = prepareForFirestore(newParticipant)
    transaction.set(participantRef, participantData)

    // Update room if assigned
    if (newParticipant.roomId && roomData) {
      const roomRef = doc(db, COLLECTIONS.ROOMS, newParticipant.roomId)
      transaction.update(roomRef, {
        occupants: [...roomData.occupants, participantId!],
      })
    }

    // Update group if assigned
    if (newParticipant.groupId && groupData) {
      const groupRef = doc(db, COLLECTIONS.GROUPS, newParticipant.groupId)
      transaction.update(groupRef, {
        members: [...groupData.members, participantId!],
      })
    }

    return { id: participantId!, ...newParticipant }
  })
}

// Delete a room
export async function deleteRoom(roomId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId))
}

// Delete a community
export async function deleteCommunity(communityId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  await deleteDoc(doc(db, COLLECTIONS.COMMUNITIES, communityId))
}

// Delete a group
export async function deleteGroup(groupId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  await deleteDoc(doc(db, COLLECTIONS.GROUPS, groupId))
}

// Delete a participant
export async function deleteParticipant(participantId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  try {
    return runTransaction(db, async (transaction) => {
      // STEP 1: ALL READS FIRST
      const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId)
      const participantDoc = await transaction.get(participantRef)

      if (!participantDoc.exists()) {
        throw new Error("Participant not found")
      }

      const participantData = participantDoc.data()
      const participant = {
        ...participantData,
        registeredAt: toISOString(participantData.registeredAt),
      } as Participant

      // Read room document if assigned
      let roomData: Room | null = null
      if (participant.roomId) {
        const roomRef = doc(db, COLLECTIONS.ROOMS, participant.roomId)
        const roomDoc = await transaction.get(roomRef)
        if (roomDoc.exists()) {
          roomData = roomDoc.data() as Room
        }
      }

      // Read group document if assigned
      let groupData: Group | null = null
      if (participant.groupId) {
        const groupRef = doc(db, COLLECTIONS.GROUPS, participant.groupId)
        const groupDoc = await transaction.get(groupRef)
        if (groupDoc.exists()) {
          groupData = groupDoc.data() as Group
        }
      }

      // STEP 2: ALL WRITES AFTER READS
      // Remove from room
      if (participant.roomId && roomData) {
        const roomRef = doc(db, COLLECTIONS.ROOMS, participant.roomId)
        transaction.update(roomRef, {
          occupants: roomData.occupants.filter((id) => id !== participantId),
        })
      }

      // Remove from group
      if (participant.groupId && groupData) {
        const groupRef = doc(db, COLLECTIONS.GROUPS, participant.groupId)
        transaction.update(groupRef, {
          members: groupData.members.filter((id) => id !== participantId),
        })
      }

      // Delete participant
      transaction.delete(participantRef)
    })
  } catch (error: any) {
    console.error("Error deleting participant:", error)
    if (error?.code === "permission-denied" || error?.code === "PERMISSION_DENIED") {
      throw new Error("Permission denied. Please check your Firestore security rules.")
    }
    if (error?.message) {
      throw error
    }
    throw new Error(`Failed to delete participant: ${error?.message || "Unknown error"}`)
  }
}

// Update a participant
export async function updateParticipant(
  participantId: string,
  updates: Partial<Omit<Participant, "id" | "registeredAt">>,
): Promise<Participant | null> {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  return runTransaction(db, async (transaction) => {
    const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId)
    const participantDoc = await transaction.get(participantRef)

    if (!participantDoc.exists()) {
      return null
    }

    const participant = { id: participantDoc.id, ...participantDoc.data() } as Participant

    // If gender changed, reassign to appropriate room
    if (updates.gender && updates.gender !== participant.gender) {
      // Remove from old room
      if (participant.roomId) {
        const oldRoomRef = doc(db, COLLECTIONS.ROOMS, participant.roomId)
        const oldRoomDoc = await transaction.get(oldRoomRef)
        if (oldRoomDoc.exists()) {
          const oldRoomData = oldRoomDoc.data() as Room
          transaction.update(oldRoomRef, {
            occupants: oldRoomData.occupants.filter((id) => id !== participantId),
          })
        }
      }

      // Assign to new room based on new gender
      const roomsSnapshot = await getDocs(query(collection(db, COLLECTIONS.ROOMS)))
      const newGenderRooms: Room[] = []
      roomsSnapshot.forEach((doc) => {
        const room = { id: doc.id, ...doc.data() } as Room
        if (room.gender === updates.gender) {
          newGenderRooms.push(room)
        }
      })

      if (newGenderRooms.length > 0) {
        const leastFilledRoom = newGenderRooms.reduce((prev, current) =>
          prev.occupants.length < current.occupants.length ? prev : current,
        )
        updates.roomId = leastFilledRoom.id
        const newRoomRef = doc(db, COLLECTIONS.ROOMS, leastFilledRoom.id)
        transaction.update(newRoomRef, {
          occupants: [...leastFilledRoom.occupants, participantId],
        })
      }
    }

    // Update participant
    const updateData = { ...updates }
    delete (updateData as any).roomId // roomId is handled separately above
    transaction.update(participantRef, updateData)

    return { ...participant, ...updates }
  })
}

