"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminDashboard from "@/components/admin-dashboard"
import RegistrationForm from "@/components/registration-form"
import ParticipantsList from "@/components/participants-list"
import WelcomeScreen from "@/components/welcome-screen"
import { Users, Settings, List, Sparkles, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const ADMIN_PIN = "1493"

export default function Home() {
  const [logoError, setLogoError] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [activeTab, setActiveTab] = useState("register")

  useEffect(() => {
    // Check if admin was authenticated in this session
    const authStatus = sessionStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAdminAuthenticated(true)
    }
  }, [])

  const handleContinue = () => {
    setShowWelcome(false)
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuthenticated(true)
      sessionStorage.setItem("adminAuthenticated", "true")
      setShowPinDialog(false)
      setPinInput("")
      setActiveTab("admin")
      toast.success("Access granted")
    } else {
      toast.error("Incorrect PIN. Please try again.")
      setPinInput("")
    }
  }

  const handleTabChange = (value: string) => {
    if (value === "admin" && !isAdminAuthenticated) {
      setShowPinDialog(true)
      setActiveTab("admin")
      return
    }
    setActiveTab(value)
  }

  const handlePinDialogClose = (open: boolean) => {
    setShowPinDialog(open)
    if (!open && !isAdminAuthenticated) {
      // If dialog is closed without authentication, switch back to register tab
      setActiveTab("register")
      setPinInput("")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden">
      {showWelcome && <WelcomeScreen onContinue={handleContinue} />}
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full relative z-10">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Logo Image - Replace '/logo.png' with your logo path (e.g., '/logo.png', '/logo.svg', '/my-logo.png') */}
                  {!logoError ? (
                    <img 
                      src="/logo.png" 
                      alt="Suhukpeeni Prayer Group Youth Camp Logo" 
                      className="w-12 h-12 rounded-xl object-contain shadow-lg ring-2 ring-primary/10"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-primary/10">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-card animate-ping" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Suhukpeeni Prayer Group
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Youth Camp 2025 - Registration Portal</p>
                </div>
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-secondary/60 backdrop-blur-sm border border-border/50 shadow-inner p-1 sm:p-1.5 rounded-xl text-xs sm:text-sm">
              <TabsTrigger 
                value="register" 
                className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:scale-[1.02]"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Register</span>
              </TabsTrigger>
              <TabsTrigger 
                value="participants" 
                className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:scale-[1.02]"
              >
                <List className="w-4 h-4" />
                <span className="font-medium">Participants</span>
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="flex gap-2 items-center justify-center transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:scale-[1.02]"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        <TabsContent value="register" className="py-6 sm:py-12 px-2 sm:px-4 lg:px-6 xl:px-8 animate-in fade-in-50 duration-500">
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <RegistrationForm />
          </div>
        </TabsContent>

        <TabsContent value="participants" className="py-4 sm:py-8 px-0 sm:px-2 lg:px-4 animate-in fade-in-50 duration-500">
          <div className="max-w-7xl mx-auto">
            <ParticipantsList />
          </div>
        </TabsContent>

        <TabsContent value="admin" className="py-8 animate-in fade-in-50 duration-500">
          {isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">Please enter the PIN to access the admin panel</p>
              <Button onClick={() => setShowPinDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Enter PIN
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={handlePinDialogClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">Admin Access</DialogTitle>
            <DialogDescription className="text-center">
              Please enter the PIN to access the admin dashboard
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-sm font-semibold">
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="h-12 text-center text-lg font-mono tracking-widest"
                autoFocus
                maxLength={10}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPinDialog(false)
                  setPinInput("")
                  setActiveTab("register")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Verify
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer with Developer Credit */}
      <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Developed by{" "}
            <span className="font-semibold text-primary">Nasara TecHub</span>
          </p>
        </div>
      </footer>
    </main>
  )
}
