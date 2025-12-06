"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getCampData, addParticipant } from "@/lib/storage"
import type { Community, Participant, CampData } from "@/lib/types"
import { toast } from "sonner"
import { CheckCircle, Send, User, Home, Users } from "lucide-react"

export default function RegistrationForm() {
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [community, setCommunity] = useState("")
  const [fee, setFee] = useState("")
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null)
  const [campData, setCampData] = useState<CampData | null>(null)

  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      const data = await getCampData()
      setCommunities(data.communities)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !community || !fee) {
      toast.error("Please fill in all fields")
      return
    }

    if (isNaN(Number.parseFloat(fee))) {
      toast.error("Please enter a valid fee amount")
      return
    }

    setLoading(true)

    try {
      const newParticipant = await addParticipant({
        name: name.trim(),
        gender,
        community,
        registrationFee: Number.parseFloat(fee),
      })

      // Reload camp data to get updated room and group names
      const updatedCampData = await getCampData()
      setCampData(updatedCampData)
      setRegisteredParticipant(newParticipant)

      setSubmitted(true)
      setTimeout(() => {
        setName("")
        setGender("male")
        setCommunity("")
        setFee("")
        setSubmitted(false)
        setRegisteredParticipant(null)
      }, 5000)

      toast.success("Registration successful!")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

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

  if (submitted && registeredParticipant) {
    const roomName = getRoomName(registeredParticipant.roomId)
    const groupName = getGroupName(registeredParticipant.groupId)

    return (
      <Card className="w-full max-w-lg mx-auto border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <CardContent className="pt-8 sm:pt-12 text-center pb-8 sm:pb-12 px-4 sm:px-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-accent relative z-10 animate-in zoom-in-50 duration-700" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-2">
            Registration Successful!
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mx-auto mb-6 px-2">
            Welcome to the youth camp! Here are your assignment details:
          </p>

          {/* Assignment Details */}
          <div className="space-y-3 sm:space-y-4 max-w-md mx-auto">
            {/* Participant ID */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Participant ID:</span>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm sm:text-base font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                {registeredParticipant.id}
              </span>
            </div>

            {/* Room Assignment */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Room:</span>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm sm:text-base font-semibold bg-card text-foreground border border-border/50">
                {roomName}
              </span>
            </div>

            {/* Group Assignment */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Group:</span>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm sm:text-base font-semibold bg-card text-foreground border border-border/50">
                {groupName}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-6 px-2">
            This information will be saved in your profile. You can view it anytime in the Participants tab.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-3 pb-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 px-8 pt-8">
        <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Camp Registration
        </CardTitle>
        <CardDescription className="text-base sm:text-lg">
          Join us for an amazing youth camp experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="gender" className="text-base font-semibold flex items-center gap-2">
              Gender
            </Label>
            <Select value={gender} onValueChange={(value: any) => setGender(value)} disabled={loading}>
              <SelectTrigger id="gender" className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="community" className="text-base font-semibold flex items-center gap-2">
              Community
            </Label>
            <Select value={community} onValueChange={setCommunity} disabled={loading}>
              <SelectTrigger id="community" className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select your community" />
              </SelectTrigger>
              <SelectContent>
                {communities.length === 0 ? (
                  <SelectItem value="no-communities" disabled>
                    No communities available
                  </SelectItem>
                ) : (
                  communities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="fee" className="text-base font-semibold flex items-center gap-2">
              Registration Fee (GHS)
            </Label>
            <Input
              id="fee"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              disabled={loading}
              className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold mt-8 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading || communities.length === 0}
          >
            <Send className="w-5 h-5" />
            {loading ? "Registering..." : "Register Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
