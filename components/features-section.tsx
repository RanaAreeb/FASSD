"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Target, Music, Link, Lock, Globe } from "lucide-react"

const features = [
  {
    title: "Real-time Detection",
    description:
      "Analyze audio streams instantly with sub-second processing times and immediate results for live applications.",
    icon: Zap,
    badge: "Fast",
    metric: "<1s",
  },
  {
    title: "99.9% Accuracy",
    description:
      "Industry-leading precision powered by advanced transformer models and multi-modal analysis techniques.",
    icon: Target,
    badge: "Precise",
    metric: "99.9%",
  },
  {
    title: "Universal Format Support",
    description:
      "Compatible with all major audio formats including MP3, WAV, FLAC, AAC, and real-time streaming protocols.",
    icon: Music,
    badge: "Compatible",
    metric: "20+ formats",
  },
  {
    title: "Enterprise API",
    description: "RESTful API with comprehensive documentation, SDKs, and enterprise-grade security and reliability.",
    icon: Link,
    badge: "Developer-Ready",
    metric: "99.9% uptime",
  },
  {
    title: "Privacy-First",
    description:
      "Zero-retention policy with end-to-end encryption. All processing happens securely without data storage.",
    icon: Lock,
    badge: "Secure",
    metric: "0 data stored",
  },
  {
    title: "Global Scale",
    description:
      "Distributed infrastructure across 15+ regions with auto-scaling to handle millions of requests per day.",
    icon: Globe,
    badge: "Scalable",
    metric: "15+ regions",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border-glow mb-8">
            <span className="text-sm font-medium text-primary">Advanced Technology</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary">Cutting-Edge Detection</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Our AI system combines multiple neural networks and advanced signal processing to identify even the most
            sophisticated deepfake audio with unmatched precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group glass-morphism border-glow hover:glow-effect transition-all duration-500 hover:-translate-y-2"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl text-primary">
                    {(() => {
                      const Icon = feature.icon
                      return <Icon className="w-10 h-10" strokeWidth={1.5} />
                    })()}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">{feature.metric}</div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {feature.badge}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
