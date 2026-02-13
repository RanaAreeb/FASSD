"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Landmark, Tv, Scale, Building2 } from "lucide-react"

export function UseCasesSection() {
  const [activeCase, setActiveCase] = useState(0)

  const useCases = [
    {
      title: "Financial Security",
      industry: "Banking & Finance",
      description: "Protect against voice-based fraud and unauthorized transactions",
      challenge: "Voice cloning attacks targeting customer service and phone banking systems",
      solution: "Real-time voice authentication and deepfake detection during calls",
      impact: "99.8% reduction in voice-based fraud attempts",
      icon: Landmark,
      color: "from-green-500 to-emerald-600",
      features: ["Real-time Call Analysis", "Voice Biometric Verification", "Fraud Alert System"],
    },
    {
      title: "Media Verification",
      industry: "News & Broadcasting",
      description: "Ensure authenticity of audio content and interviews",
      challenge: "Deepfake audio spreading misinformation and fake news",
      solution: "Automated content verification before publication",
      impact: "100% authentic content guarantee for subscribers",
      icon: Tv,
      color: "from-blue-500 to-cyan-600",
      features: ["Content Verification", "Source Authentication", "Integrity Scoring"],
    },
    {
      title: "Legal Evidence",
      industry: "Law Enforcement",
      description: "Verify audio evidence in legal proceedings",
      challenge: "Ensuring audio evidence hasn't been manipulated or synthesized",
      solution: "Forensic-grade audio analysis and chain of custody verification",
      impact: "Court-admissible evidence verification",
      icon: Scale,
      color: "from-purple-500 to-indigo-600",
      features: ["Forensic Analysis", "Evidence Integrity", "Expert Testimony Support"],
    },
    {
      title: "Corporate Security",
      industry: "Enterprise",
      description: "Protect against social engineering and impersonation attacks",
      challenge: "CEO fraud and executive impersonation via voice cloning",
      solution: "Employee training and real-time communication verification",
      impact: "Zero successful voice impersonation attacks",
      icon: Building2,
      color: "from-orange-500 to-red-600",
      features: ["Executive Protection", "Communication Verification", "Security Training"],
    },
  ]

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-muted/20 via-background to-muted/20">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 font-futuristic">
            REAL-WORLD APPLICATIONS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-futuristic font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Protecting Every Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From financial institutions to media companies, our technology safeguards against deepfake threats across
            all sectors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Use Case Cards */}
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  activeCase === index
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50 scale-105"
                    : "hover:scale-102"
                }`}
                onClick={() => setActiveCase(index)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${useCase.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    {(() => {
                      const Icon = useCase.icon
                      return <Icon className="w-8 h-8" strokeWidth={2} />
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-futuristic font-bold text-xl">{useCase.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {useCase.industry}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed View */}
          <div className="relative">
            <Card className="p-8 bg-gradient-to-br from-card/80 to-muted/40 backdrop-blur-sm border-primary/20 h-full">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-20 h-20 rounded-xl bg-gradient-to-r ${useCases[activeCase].color} flex items-center justify-center text-white shadow-lg`}
                  >
                    {(() => {
                      const Icon = useCases[activeCase].icon
                      return <Icon className="w-10 h-10" strokeWidth={2} />
                    })()}
                  </div>
                  <div>
                    <h3 className="font-futuristic text-2xl font-bold text-primary">{useCases[activeCase].title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {useCases[activeCase].industry}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-destructive">The Challenge</h4>
                  <p className="text-muted-foreground">{useCases[activeCase].challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-primary">Our Solution</h4>
                  <p className="text-muted-foreground">{useCases[activeCase].solution}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-green-600">Impact</h4>
                  <p className="text-muted-foreground font-medium">{useCases[activeCase].impact}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Key Features</h4>
                  <div className="grid gap-2">
                    {useCases[activeCase].features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-8 font-futuristic" variant="default">
                Learn More About This Solution
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
