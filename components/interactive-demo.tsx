"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AudioVisualizer } from "./audio-visualizer"

const demoSamples = [
  {
    id: 1,
    name: "Authentic Speech",
    description: "Real human voice recording",
    isDeepfake: false,
    confidence: 97,
    duration: "0:15",
  },
  {
    id: 2,
    name: "AI Generated Voice",
    description: "Synthetic voice created with AI",
    isDeepfake: true,
    confidence: 94,
    duration: "0:12",
  },
  {
    id: 3,
    name: "Voice Clone",
    description: "Cloned celebrity voice",
    isDeepfake: true,
    confidence: 89,
    duration: "0:18",
  },
]

export function InteractiveDemo() {
  const [selectedSample, setSelectedSample] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const analyzeSample = async (sampleId: number) => {
    setSelectedSample(sampleId)
    setIsAnalyzing(true)
    setShowResult(false)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          setShowResult(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const selectedSampleData = demoSamples.find((s) => s.id === selectedSample)

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border-glow mb-8">
            <span className="text-sm font-medium text-primary">Interactive Experience</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary">Try Live Detection</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Experience our AI detection technology with sample audio files. See how accurately we identify deepfake
            audio in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sample Selection */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Choose a Sample</h3>
            {demoSamples.map((sample) => (
              <Card
                key={sample.id}
                className={`cursor-pointer transition-all duration-300 hover:glow-effect ${
                  selectedSample === sample.id
                    ? "border-primary/50 glow-effect"
                    : "border-border/50 hover:border-primary/30"
                } glass-morphism`}
                onClick={() => analyzeSample(sample.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{sample.name}</CardTitle>
                    <Badge variant={sample.isDeepfake ? "destructive" : "secondary"} className="rounded-full">
                      {sample.isDeepfake ? "Synthetic" : "Authentic"}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{sample.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration: {sample.duration}</span>
                    <Button
                      size="sm"
                      variant={selectedSample === sample.id ? "default" : "outline"}
                      className="rounded-full px-6"
                    >
                      {selectedSample === sample.id && isAnalyzing ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Analysis Results</h3>

            {!selectedSample && (
              <Card className="glass-morphism border-dashed border-border/50 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-muted-foreground">Select a sample to see AI detection in action</p>
                </CardContent>
              </Card>
            )}

            {selectedSample && isAnalyzing && (
              <Card className="glass-morphism border-primary/50 glow-effect">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-medium">Analyzing Audio...</span>
                    </div>
                    <Progress value={analysisProgress} className="h-4 rounded-full" />
                    <div className="h-20 bg-card/30 rounded-2xl border border-border/30 p-4">
                      <AudioVisualizer isActive={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedSample && showResult && selectedSampleData && (
              <Card className="glass-morphism border-border/50 glow-effect">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Detection Complete</CardTitle>
                    <Badge
                      variant={selectedSampleData.isDeepfake ? "destructive" : "secondary"}
                      className="rounded-full px-4 py-1"
                    >
                      {selectedSampleData.isDeepfake ? "Deepfake Detected" : "Authentic Audio"}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">Analysis for {selectedSampleData.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Confidence Score</span>
                      <span
                        className={`text-2xl font-bold ${
                          selectedSampleData.confidence >= 90
                            ? "text-green-500"
                            : selectedSampleData.confidence >= 70
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {selectedSampleData.confidence}%
                      </span>
                    </div>
                    <Progress value={selectedSampleData.confidence} className="h-3 rounded-full" />
                  </div>

                  <div className="h-20 bg-card/30 rounded-2xl border border-border/30 p-4">
                    <AudioVisualizer isActive={false} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-xl text-center">
                      <div className="text-xl font-bold">{selectedSampleData.duration}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl text-center">
                      <div className="text-xl font-bold">0.8s</div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedSample(null)
                      setShowResult(false)
                      setAnalysisProgress(0)
                    }}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-effect"
                  >
                    Try Another Sample
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
