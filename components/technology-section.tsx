"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function TechnologySection() {
  const [selectedTech, setSelectedTech] = useState(0)

  const technologies = [
    {
      name: "Neural Architecture",
      description: "Advanced transformer models with attention mechanisms",
      details:
        "Our proprietary neural network architecture combines multiple transformer layers with specialized attention mechanisms designed specifically for audio analysis.",
      metrics: ["99.7% Accuracy", "0.3s Processing", "Real-time Analysis"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Spectral Analysis",
      description: "Deep frequency domain pattern recognition",
      details:
        "Sophisticated spectral analysis algorithms examine frequency patterns, harmonics, and phase relationships that are invisible to human ears but detectable by AI.",
      metrics: ["Multi-band Processing", "Phase Coherence", "Harmonic Analysis"],
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Temporal Modeling",
      description: "Time-series analysis for voice consistency",
      details:
        "Advanced temporal modeling tracks voice characteristics over time, detecting inconsistencies in speech patterns that indicate synthetic generation.",
      metrics: ["Voice Continuity", "Rhythm Analysis", "Prosody Detection"],
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 font-futuristic">
            CUTTING-EDGE TECHNOLOGY
          </Badge>
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-primary drop-shadow-lg">
            The Science Behind Detection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powered by breakthrough AI research and quantum-inspired algorithms
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Technology Cards */}
          <div className="space-y-6">
            {technologies.map((tech, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedTech === index
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50 scale-105"
                    : "hover:scale-102"
                }`}
                onClick={() => setSelectedTech(index)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tech.color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-orbitron font-semibold text-xl mb-2">{tech.name}</h3>
                    <p className="text-muted-foreground mb-4">{tech.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tech.metrics.map((metric, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Technology Details */}
          <div className="relative">
            <Card className="p-8 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-primary/20">
              <div className="mb-6">
                <h3 className="font-orbitron text-2xl font-bold mb-4 text-primary">
                  {technologies[selectedTech].name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{technologies[selectedTech].details}</p>
              </div>

              {/* Animated Visualization */}
              <div className="relative h-48 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-r ${technologies[selectedTech].color} opacity-20 animate-pulse`}
                  />
                  <div
                    className={`absolute w-24 h-24 rounded-full bg-gradient-to-r ${technologies[selectedTech].color} opacity-40 animate-ping`}
                  />
                  <div
                    className={`absolute w-16 h-16 rounded-full bg-gradient-to-r ${technologies[selectedTech].color} opacity-60`}
                  />
                </div>

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-r ${technologies[selectedTech].color} rounded-full opacity-60`}
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 2) * 40}%`,
                      animation: `float ${2 + i * 0.5}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>

              <Button className="w-full mt-6 font-orbitron bg-transparent" variant="outline">
                Learn More About This Technology
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  )
}
