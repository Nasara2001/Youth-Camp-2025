"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { isOnline } from "@/lib/offline-storage"
import { syncWithFirebase } from "@/lib/sync"

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const status = isOnline()
      setOnline(status)
      
      if (status) {
        // Just came online, trigger sync
        setSyncing(true)
        syncWithFirebase()
          .then(() => {
            setSyncing(false)
          })
          .catch((error) => {
            console.error("Sync error:", error)
            setSyncing(false)
          })
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (online && !syncing) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border ${
          online && syncing
            ? "bg-blue-500 text-white border-blue-600"
            : "bg-red-500 text-white border-red-600"
        }`}
      >
        {online && syncing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm font-medium">Syncing...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </>
        )}
      </div>
    </div>
  )
}

