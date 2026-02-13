"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Brain, Search, Check } from "lucide-react"

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Audio Input",
      description: "Upload or record audio files for analysis",
      icon: Music,
      detail: "Our system accepts multiple audio formats and processes them in real-time",
    },
    {
      title: "AI Analysis",
      description: "Advanced neural networks analyze audio patterns",
      icon: Brain,
      detail: "Deep learning models trained on millions of audio samples detect anomalies",
    },
    {
      title: "Pattern Recognition",
      description: "Identify synthetic audio signatures and artifacts",
      icon: Search,
      detail: "Sophisticated algorithms detect subtle inconsistencies in voice patterns",
    },
    {
      title: "Results",
      description: "Get instant verification with confidence scores",
      icon: Check,
      detail: "Receive detailed reports with probability scores and evidence markers",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 font-futuristic">
            HOW IT WORKS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-futuristic font-bold mb-6 text-foreground bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent [text-shadow:_0_0_20px_rgb(59_130_246_/_50%)]">
            Revolutionary Detection Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our cutting-edge AI technology uses advanced neural networks to detect deepfake audio with unprecedented
            accuracy
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className={`p-6 relative overflow-hidden transition-all duration-500 cursor-pointer group ${
                activeStep === index
                  ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 scale-105"
                  : "hover:scale-102"
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div
                  className={`text-4xl mb-4 transition-transform duration-300 text-primary ${
                    activeStep === index ? "scale-110" : ""
                  }`}
                >
                  {(() => {
                    const Icon = step.icon
                    return <Icon className="w-10 h-10" strokeWidth={1.5} />
                  })()}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      activeStep === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="font-futuristic font-semibold text-lg">{step.title}</h3>
                </div>

                <p className="text-muted-foreground mb-4">{step.description}</p>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeStep === index ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm text-primary font-medium">{step.detail}</p>
                </div>
              </div>

              {/* Animated border */}
              <div
                className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                  activeStep === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-accent to-primary opacity-20 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
