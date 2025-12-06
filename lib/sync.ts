// Sync utility to sync localStorage with Firebase when online
import * as firebaseDb from "./firebase/db"
import * as offlineStorage from "./offline-storage"
import type { QueuedOperation } from "./offline-storage"

export async function syncWithFirebase(): Promise<void> {
  if (!offlineStorage.isOnline()) {
    console.log("Not online, skipping sync")
    return
  }

  try {
    const { db } = await import("./firebase/config")
    if (!db) {
      console.log("Firebase not initialized, skipping sync")
      return
    }
  } catch {
    console.log("Firebase not available, skipping sync")
    return
  }

  const queue = offlineStorage.getSyncQueue()
  if (queue.length === 0) {
    return
  }

  console.log(`Syncing ${queue.length} queued operations...`)

  const errors: string[] = []

  for (const operation of queue) {
    try {
      switch (operation.type) {
        case "add":
          switch (operation.collection) {
            case "rooms":
              if (operation.data) {
                await firebaseDb.addRoom(operation.data)
              }
              break
            case "communities":
              if (operation.data?.name) {
                await firebaseDb.addCommunity(operation.data.name)
              }
              break
            case "groups":
              if (operation.data?.name) {
                await firebaseDb.addGroup(operation.data.name)
              }
              break
            case "participants":
              if (operation.data && operation.id) {
                // Check if participant already exists in Firebase (to prevent duplicates)
                const { db } = await import("./firebase/config")
                const { doc, getDoc, setDoc, Timestamp, collection } = await import("firebase/firestore")
                
                if (db) {
                  const participantRef = doc(db, "participants", operation.id)
                  const existingDoc = await getDoc(participantRef)
                  
                  if (existingDoc.exists()) {
                    console.log(`Participant ${operation.id} already exists in Firebase, skipping sync`)
                    break // Skip - already synced
                  }
                  
                  // Add participant with the same ID to prevent duplicates
                  const participantData = { ...operation.data }
                  // Convert registeredAt string to Timestamp if needed
                  if (participantData.registeredAt && typeof participantData.registeredAt === "string") {
                    participantData.registeredAt = Timestamp.fromDate(new Date(participantData.registeredAt))
                  }
                  
                  await setDoc(participantRef, participantData)
                  
                  // Update room and group if assigned
                  if (participantData.roomId) {
                    const roomRef = doc(db, "rooms", participantData.roomId)
                    const roomDoc = await getDoc(roomRef)
                    if (roomDoc.exists()) {
                      const roomData = roomDoc.data()
                      const occupants = roomData.occupants || []
                      if (!occupants.includes(operation.id)) {
                        await setDoc(roomRef, {
                          ...roomData,
                          occupants: [...occupants, operation.id]
                        }, { merge: true })
                      }
                    }
                  }
                  
                  if (participantData.groupId) {
                    const groupRef = doc(db, "groups", participantData.groupId)
                    const groupDoc = await getDoc(groupRef)
                    if (groupDoc.exists()) {
                      const groupData = groupDoc.data()
                      const members = groupData.members || []
                      if (!members.includes(operation.id)) {
                        await setDoc(groupRef, {
                          ...groupData,
                          members: [...members, operation.id]
                        }, { merge: true })
                      }
                    }
                  }
                  
                  console.log(`Synced participant ${operation.id} to Firebase`)
                }
              }
              break
          }
          break
        case "update":
          if (operation.collection === "participants" && operation.data) {
            const { id, registeredAt, ...updates } = operation.data
            if (id) {
              await firebaseDb.updateParticipant(id, updates)
            }
          }
          break
        case "delete":
          switch (operation.collection) {
            case "rooms":
              await firebaseDb.deleteRoom(operation.id)
              break
            case "communities":
              await firebaseDb.deleteCommunity(operation.id)
              break
            case "groups":
              await firebaseDb.deleteGroup(operation.id)
              break
            case "participants":
              await firebaseDb.deleteParticipant(operation.id)
              break
          }
          break
      }
    } catch (error: any) {
      console.error(`Error syncing operation ${operation.type} ${operation.collection} ${operation.id}:`, error)
      errors.push(`${operation.type} ${operation.collection} ${operation.id}: ${error.message}`)
    }
  }

  // Always refresh local data from Firebase after sync attempt
  // This ensures we have the latest data and removes any duplicates
  try {
    const freshData = await firebaseDb.getCampData()
    offlineStorage.saveLocalData(freshData)
    console.log("Local data refreshed from Firebase")
  } catch (error) {
    console.error("Error refreshing local data:", error)
  }

  if (errors.length === 0) {
    // All operations synced successfully, clear queue
    offlineStorage.clearSyncQueue()
    console.log("Sync completed successfully")
  } else {
    console.warn("Some operations failed to sync:", errors)
    // Keep failed operations in queue for retry
  }
}

// Set up automatic sync when coming online
if (typeof window !== "undefined") {
  // Sync on initial load if online
  if (offlineStorage.isOnline()) {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
      syncWithFirebase().catch((error) => {
        console.error("Error during initial sync:", error)
      })
    }, 2000)
  }

  window.addEventListener("online", () => {
    console.log("Connection restored, syncing...")
    syncWithFirebase().catch((error) => {
      console.error("Error during automatic sync:", error)
    })
  })
}

