"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Deterministic pseudo-random from index - avoids hydration mismatch (Math.random differs on server vs client)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function StatsSection() {
  const [counters, setCounters] = useState({
    accuracy: 0,
    processed: 0,
    saved: 0,
    speed: 0,
  })

  const finalStats = {
    accuracy: 99.7,
    processed: 2500000,
    saved: 15000,
    speed: 0.3,
  }

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const intervals = Object.keys(finalStats).map((key) => {
      const finalValue = finalStats[key as keyof typeof finalStats]
      const increment = finalValue / steps

      return setInterval(() => {
        setCounters((prev) => ({
          ...prev,
          [key]: Math.min(prev[key as keyof typeof prev] + increment, finalValue),
        }))
      }, stepDuration)
    })

    setTimeout(() => {
      intervals.forEach(clearInterval)
      setCounters(finalStats)
    }, duration)

    return () => intervals.forEach(clearInterval)
  }, [])

  const stats = [
    {
      value: `${counters.accuracy.toFixed(1)}%`,
      label: "Detection Accuracy",
      description: "Industry-leading precision in identifying deepfake audio",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: `${(counters.processed / 1000000).toFixed(1)}M+`,
      label: "Audio Files Analyzed",
      description: "Millions of audio samples processed and verified",
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: `${(counters.saved / 1000).toFixed(0)}K+`,
      label: "Fraud Cases Prevented",
      description: "Potential fraud attempts stopped by our technology",
      color: "from-purple-500 to-pink-500",
    },
    {
      value: `${counters.speed.toFixed(1)}s`,
      label: "Average Processing Time",
      description: "Lightning-fast real-time audio analysis",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${seededRandom(i) * 100}%`,
              top: `${seededRandom(i + 100) * 100}%`,
              animationDelay: `${seededRandom(i + 200) * 2}s`,
              animationDuration: `${2 + seededRandom(i + 300) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 font-futuristic">
            PROVEN RESULTS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-futuristic font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Numbers That Speak
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-world impact and performance metrics from our deepfake detection system
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 relative overflow-hidden group hover:scale-105 transition-all duration-300"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-r ${stat.color} opacity-20 animate-pulse`}
                />
              </div>

              <div className="relative z-10 text-center">
                <div
                  className={`text-4xl md:text-5xl font-futuristic font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>

                <h3 className="font-futuristic text-2xl font-bold mb-4 text-foreground">{stat.label}</h3>

                <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full opacity-60 animate-ping" />
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-accent rounded-full opacity-40 animate-pulse" />
            </Card>
          ))}
        </div>

        {/* Additional Impact Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 max-w-4xl mx-auto">
            <h3 className="font-futuristic text-2xl font-bold mb-4 text-primary">Global Impact</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our technology is actively protecting organizations worldwide, from financial institutions preventing
              voice-based fraud to media companies ensuring content authenticity. Every day, we're making the digital
              world a safer place by staying ahead of evolving deepfake threats.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
