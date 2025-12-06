"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, Calendar, Users, MapPin, Heart } from "lucide-react"

interface WelcomeScreenProps {
  onContinue: () => void
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [logoError, setLogoError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-2 sm:p-4 lg:p-6 animate-in fade-in duration-500 overflow-y-auto">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Card className="relative z-10 w-full max-w-4xl border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-700 my-4 sm:my-6">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
          {/* Logo and Header */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8 animate-in slide-in-from-top-4 duration-700 delay-200">
            <div className="relative mb-4 sm:mb-6">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Suhukpeeni Prayer Group Youth Camp Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl object-contain shadow-xl ring-2 sm:ring-4 ring-primary/20 animate-in zoom-in-50 duration-700"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl ring-2 sm:ring-4 ring-primary/20 animate-in zoom-in-50 duration-700">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-foreground" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-accent rounded-full border-2 sm:border-4 border-card animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2 sm:mb-3 px-2">
              Welcome to Suhukpeeni Prayer Group Youth Camp 2025
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl px-2">
              Join us for an unforgettable experience filled with growth, friendship, and adventure
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 animate-in fade-in-50 duration-700 delay-400">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold mb-1">Registration</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Quick & Easy Sign Up</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold mb-1">Community</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Connect with Others</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold mb-1">Organized</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Room & Group Assignment</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all hover:scale-105">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold mb-1">Memorable</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Unforgettable Experience</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-600">
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
              Start your registration journey today
            </p>
          </div>

          {/* Developer Credit */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 animate-in fade-in-50 duration-700 delay-800">
            <p className="text-center text-[10px] sm:text-xs lg:text-sm text-muted-foreground px-2">
              Developed by{" "}
              <span className="font-semibold text-primary">Nasara TecHub</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
