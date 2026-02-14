"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { UploadZone } from "@/components/upload-zone"
import { DetectionResults } from "@/components/detection-results"
import { saveAudioAnalysis, getAttackTypeForDeepfake } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2 } from "lucide-react"

// Mock detection result for demo
const mockResult = {
  filename: "sample_audio.mp3",
  confidence: 94,
  isDeepfake: false,
  attackType: "Authentic",
  processingTime: 2.3,
  fileSize: "4.2 MB",
  duration: "2:45",
  details: {
    spectralAnalysis: 96,
    temporalConsistency: 92,
    neuralNetworkScore: 94,
    artifactDetection: 89,
  },
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<typeof mockResult | null>(null)
  const [processingStep, setProcessingStep] = useState("")

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setResult(null)

    const steps = [
      "Uploading file...",
      "Extracting audio features...",
      "Running spectral analysis...",
      "Checking temporal consistency...",
      "Processing neural network...",
      "Detecting artifacts...",
      "Generating report...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i])
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    const isDeepfake = Math.random() > 0.6 // Demo: random result
    const attackType = getAttackTypeForDeepfake(isDeepfake)
    const confidence = isDeepfake ? 75 + Math.floor(Math.random() * 20) : 88 + Math.floor(Math.random() * 10)

    const analysisResult = {
      ...mockResult,
      filename: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      isDeepfake,
      attackType,
      confidence,
    }

    if (user?.uid) {
      await saveAudioAnalysis(user.uid, {
        filename: analysisResult.filename,
        fileSize: analysisResult.fileSize,
        duration: analysisResult.duration,
        isDeepfake: analysisResult.isDeepfake,
        confidence: analysisResult.confidence,
        attackType: analysisResult.attackType,
        processingTime: analysisResult.processingTime,
        details: analysisResult.details,
      })
    }

    setResult(analysisResult)
    setIsProcessing(false)
    setProcessingStep("")
  }

  const handleNewAnalysis = () => {
    setResult(null)
    setIsProcessing(false)
    setProcessingStep("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Detection Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Upload audio files to detect deepfake manipulation with AI-powered analysis
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Files Analyzed</CardDescription>
              <CardTitle className="text-2xl">1,247</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass-effect border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Deepfakes Detected</CardDescription>
              <CardTitle className="text-2xl text-red-500">89</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass-effect border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Accuracy Rate</CardDescription>
              <CardTitle className="text-2xl text-green-500">99.7%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass-effect border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Processing Time</CardDescription>
              <CardTitle className="text-2xl">2.1s</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!result && !isProcessing && <UploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />}

          {isProcessing && (
            <Card className="glass-effect border-border/50 shadow-glow">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Processing Audio</h3>
                    <p className="text-muted-foreground">{processingStep}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    AI Analysis in Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {result && <DetectionResults result={result} onNewAnalysis={handleNewAnalysis} />}
        </div>

        {/* Python Backend Integration Note */}
        <Card className="mt-8 glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-primary" strokeWidth={2} />
              <span>Backend Integration</span>
            </CardTitle>
            <CardDescription>
              This frontend is ready for Python backend integration for actual deepfake detection processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
              <div className="text-muted-foreground mb-2"># Python API Endpoint Structure</div>
              <div>POST /api/analyze-audio</div>
              <div className="text-muted-foreground"># Upload audio file and receive detection results</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
