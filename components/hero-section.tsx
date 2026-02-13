"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AudioVisualizer } from "./audio-visualizer"
import { ParallaxWrapper } from "./parallax-wrapper"
// Removed GlobeDemo import - using simple animated globe instead

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      className="relative min-h-screen flex items-start justify-center overflow-hidden pt-20 lg:pt-24 pb-8"
      style={{
        background: `
                 radial-gradient(circle at 20% 30%, oklch(0.7 0.25 260 / 0.25) 0%, transparent 60%),
                 radial-gradient(circle at 80% 70%, oklch(0.75 0.2 280 / 0.2) 0%, transparent 60%),
                 radial-gradient(circle at 50% 50%, oklch(0.65 0.3 240 / 0.15) 0%, transparent 70%),
                 linear-gradient(135deg, oklch(0.08 0.02 260) 0%, oklch(0.12 0.02 260) 50%, oklch(0.1 0.02 260) 100%)
               `,
        backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%",
      }}
    >
      {/* Simple animated background elements */}
      <ParallaxWrapper speed={0.3} className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] 
                        bg-gradient-radial from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse"
        />
        <div
          className="absolute top-3/4 right-1/4 w-[600px] h-[600px] 
                        bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-2xl animate-pulse delay-1000"
        />
      </ParallaxWrapper>

      <ParallaxWrapper speed={0.2} className="absolute inset-0 opacity-30">
        <div
          style={{
            backgroundImage: `
               linear-gradient(oklch(0.7 0.25 260 / 0.3) 1px, transparent 1px),
               linear-gradient(90deg, oklch(0.7 0.25 260 / 0.3) 1px, transparent 1px)
             `,
            backgroundSize: "60px 60px",
            height: "120%",
          }}
        />
      </ParallaxWrapper>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`text-center space-y-6 sm:space-y-8 lg:space-y-10 ${isLoaded ? "animate-float-up" : "opacity-0"}`}>
          <div className="flex justify-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-morphism border-glow">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-primary font-mono tracking-wider">NEXT-GEN AI DETECTION</span>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-orbitron font-black tracking-tight leading-tight">
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-1 sm:mb-2">
                <span className="block text-gradient-primary drop-shadow-2xl">DETECT</span>
              </div>
              <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-1 sm:mb-2">
                <span className="block text-gradient-primary drop-shadow-2xl">DEEPFAKE</span>
              </div>
              <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                <span className="block text-foreground drop-shadow-xl">AUDIO</span>
              </div>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light px-4 sm:px-6">
              Revolutionary AI technology that identifies synthetic audio with{" "}
              <span className="text-primary font-semibold">99.9% accuracy</span>.
              <br className="hidden sm:block" />
              Protect your organization from audio manipulation.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-glow relative overflow-hidden">
              {/* Background pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                       linear-gradient(45deg, oklch(0.7 0.25 260 / 0.1) 25%, transparent 25%),
                       linear-gradient(-45deg, oklch(0.7 0.25 260 / 0.1) 25%, transparent 25%),
                       linear-gradient(45deg, transparent 75%, oklch(0.7 0.25 260 / 0.1) 75%),
                       linear-gradient(-45deg, transparent 75%, oklch(0.7 0.25 260 / 0.1) 75%)
                     `,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />

              <div className="relative z-10">
                <div className="h-20 sm:h-24 md:h-28 lg:h-32 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden bg-card/30 border border-primary/20 relative">
                  <AudioVisualizer isActive={isPlaying} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-orbitron text-xs sm:text-sm text-muted-foreground tracking-widest">
                      {isPlaying ? "ANALYZING..." : "READY TO ANALYZE"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full glow-effect transition-all duration-300 hover:scale-105 font-orbitron font-semibold tracking-wider w-full sm:w-auto"
                  >
                    {isPlaying ? "STOP ANALYSIS" : "START DEMO"}
                  </Button>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs sm:text-sm font-mono">Real-time AI detection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 pb-16 sm:pb-20">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 lg:px-12 py-2 sm:py-3 text-sm sm:text-base rounded-full glow-effect transition-all duration-300 hover:scale-105 font-orbitron font-semibold tracking-wider w-full sm:w-auto"
            >
              TRY DETECTION NOW
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary/50 hover:border-primary text-foreground hover:text-primary hover:bg-primary/10 px-8 sm:px-10 lg:px-12 py-2 sm:py-3 text-sm sm:text-base rounded-full transition-all duration-300 hover:scale-105 glass-morphism font-orbitron font-medium tracking-wider w-full sm:w-auto bg-transparent"
            >
              VIEW DOCUMENTATION
            </Button>
          </div>

        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-5 h-10 sm:w-6 sm:h-12 border-2 border-primary/60 rounded-full flex justify-center animate-pulse-border">
          <div className="w-1 h-3 sm:h-4 bg-primary rounded-full mt-1.5 sm:mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
