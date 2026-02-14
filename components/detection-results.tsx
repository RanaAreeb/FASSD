"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AudioVisualizer } from "./audio-visualizer"

interface DetectionResult {
  filename: string
  confidence: number
  isDeepfake: boolean
  attackType?: string
  processingTime: number
  fileSize: string
  duration: string
  details: {
    spectralAnalysis: number
    temporalConsistency: number
    neuralNetworkScore: number
    artifactDetection: number
  }
}

interface DetectionResultsProps {
  result: DetectionResult
  onNewAnalysis: () => void
}

export function DetectionResults({ result, onNewAnalysis }: DetectionResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (isDeepfake: boolean, confidence: number) => {
    if (isDeepfake) {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white">
          Deepfake Detected
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-green-500 text-white">
        Authentic Audio
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="glass-effect border-border/50 shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Detection Complete</CardTitle>
              <CardDescription>Analysis results for {result.filename}</CardDescription>
              {result.attackType && (
                <Badge variant="outline" className="mt-2">
                  Attack Type: {result.attackType}
                </Badge>
              )}
            </div>
            {getConfidenceBadge(result.isDeepfake, result.confidence)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                {result.confidence}%
              </span>
            </div>
            <Progress value={result.confidence} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {result.isDeepfake
                ? "High probability of synthetic audio manipulation detected"
                : "Audio appears to be authentic with no signs of manipulation"}
            </p>
          </div>

          {/* Audio Visualizer */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Audio Waveform Analysis</h4>
            <div className="h-24 bg-card/50 rounded-lg border border-border/50 p-4">
              <AudioVisualizer isActive={true} />
            </div>
          </div>

          {/* File Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">{result.fileSize}</div>
              <div className="text-xs text-muted-foreground">File Size</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">{result.duration}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">{result.processingTime}s</div>
              <div className="text-xs text-muted-foreground">Processing Time</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">AI Model</div>
              <div className="text-xs text-muted-foreground">FASSD v2.1</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Breakdown of detection algorithms and their confidence scores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Spectral Analysis</span>
              <span className="text-sm font-medium">{result.details.spectralAnalysis}%</span>
            </div>
            <Progress value={result.details.spectralAnalysis} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Temporal Consistency</span>
              <span className="text-sm font-medium">{result.details.temporalConsistency}%</span>
            </div>
            <Progress value={result.details.temporalConsistency} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Neural Network Score</span>
              <span className="text-sm font-medium">{result.details.neuralNetworkScore}%</span>
            </div>
            <Progress value={result.details.neuralNetworkScore} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Artifact Detection</span>
              <span className="text-sm font-medium">{result.details.artifactDetection}%</span>
            </div>
            <Progress value={result.details.artifactDetection} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onNewAnalysis} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
          Analyze Another File
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Download Report
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Share Results
        </Button>
      </div>
    </div>
  )
}
