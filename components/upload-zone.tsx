"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export function UploadZone({ onFileUpload, isProcessing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const audioFile = files.find((file) => file.type.startsWith("audio/"))

      if (audioFile) {
        simulateUpload(audioFile)
      }
    },
    [onFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        simulateUpload(file)
      }
    },
    [onFileUpload],
  )

  const simulateUpload = (file: File) => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          onFileUpload(file)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <Card
      className={`transition-all duration-300 ${
        isDragOver ? "border-primary bg-primary/5 shadow-glow" : "border-dashed border-border hover:border-primary/50"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
    >
      <CardContent className="p-8">
        <div
          className="text-center space-y-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload Audio File</h3>
            <p className="text-muted-foreground">Drag and drop your audio file here, or click to browse</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">MP3</Badge>
            <Badge variant="secondary">WAV</Badge>
            <Badge variant="secondary">FLAC</Badge>
            <Badge variant="secondary">M4A</Badge>
            <Badge variant="secondary">OGG</Badge>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="audio-upload"
              disabled={isProcessing}
            />
            <label htmlFor="audio-upload">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 cursor-pointer"
                disabled={isProcessing}
                asChild
              >
                <span>Choose File</span>
              </Button>
            </label>

            <p className="text-xs text-muted-foreground">
              Maximum file size: 50MB • Supported formats: MP3, WAV, FLAC, M4A, OGG
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
