"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoomsTab from "./admin/rooms-tab"
import CommunitiesTab from "./admin/communities-tab"
import GroupsTab from "./admin/groups-tab"
import ParticipantsTab from "./admin/participants-tab"
import { Building2, Users, Layers, Users2 } from "lucide-react"

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 animate-in fade-in-50 slide-in-from-top-4 duration-500">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent mb-3">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl">Manage all camp resources, participants, and assignments</p>
      </div>

      <Tabs defaultValue="participants" className="w-full animate-in fade-in-50 duration-500">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/60 backdrop-blur-sm border border-border/50 shadow-inner p-1.5 rounded-xl">
          <TabsTrigger
            value="participants"
            className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-[1.02] font-medium"
          >
            <Users2 className="w-4 h-4" />
            <span className="hidden sm:inline">Participants</span>
          </TabsTrigger>
          <TabsTrigger
            value="rooms"
            className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-[1.02] font-medium"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger
            value="communities"
            className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-[1.02] font-medium"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Communities</span>
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-[1.02] font-medium"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6 animate-in fade-in-50 duration-300">
          <ParticipantsTab />
        </TabsContent>

        <TabsContent value="rooms" className="mt-6 animate-in fade-in-50 duration-300">
          <RoomsTab />
        </TabsContent>

        <TabsContent value="communities" className="mt-6 animate-in fade-in-50 duration-300">
          <CommunitiesTab />
        </TabsContent>

        <TabsContent value="groups" className="mt-6 animate-in fade-in-50 duration-300">
          <GroupsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
