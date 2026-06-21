"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getAudioHistory, getForensicReport, type AudioAnalysis } from "@/lib/firestore"
import { uploadAvatar } from "@/lib/profile"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Music, FileText, LogOut, Camera } from "lucide-react"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, userProfile, signOut, updateUserProfile } = useAuth()
  const [audioHistory, setAudioHistory] = useState<AudioAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<AudioAnalysis | null>(null)

  const avatarUrl = userProfile?.avatarUrl || user?.photoURL || null
  const displayName = userProfile?.name || user?.displayName || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, GIF)")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB")
      return
    }
    setAvatarLoading(true)
    try {
      const url = await uploadAvatar(user.uid, file)
      if (url) await updateUserProfile({ avatarUrl: url })
    } catch (err) {
      console.error("Avatar upload failed:", err)
    } finally {
      setAvatarLoading(false)
      e.target.value = ""
    }
  }

  useEffect(() => {
    if (user?.uid) {
      getAudioHistory(user.uid).then((history) => {
        setAudioHistory(history)
        setLoading(false)
      })
    }
  }, [user?.uid])

  const handleViewReport = async (id: string) => {
    const report = audioHistory.find((a) => a.id === id) || (await getForensicReport(id))
    setSelectedReport(report || null)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Info */}
        <Card className="glass-effect border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-20 h-20 border-2 border-primary/30">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                      {initials || <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {avatarLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {userProfile?.email || user?.email}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">Click camera icon to change avatar</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Audio Upload History */}
        <Card className="glass-effect border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Audio Upload History
            </CardTitle>
            <CardDescription>Your recent audio analyses and prediction results</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : audioHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No audio analyses yet. Upload audio in the dashboard to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {audioHistory.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{analysis.filename}</div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{analysis.fileSize}</span>
                        <span>•</span>
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={analysis.isDeepfake ? "destructive" : "secondary"}
                          className={!analysis.isDeepfake ? "bg-green-500/20 text-green-600" : ""}
                        >
                          {analysis.isDeepfake ? "AI likely" : "Human likely"}
                        </Badge>
                        {analysis.attackType && (
                          <Badge variant="outline">{analysis.attackType}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => analysis.id && handleViewReport(analysis.id)}
                    >
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis report detail */}
        {selectedReport && (
          <Card className="glass-effect border-border/50 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Analysis Report
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
              <CardDescription>{selectedReport.filename}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">File verdict</div>
                  <Badge
                    variant={selectedReport.isDeepfake ? "destructive" : "secondary"}
                    className={!selectedReport.isDeepfake ? "bg-green-500/20 text-green-600" : ""}
                  >
                    {selectedReport.isDeepfake ? "AI likely" : "Human likely"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Attack Type</div>
                  <div className="font-medium">{selectedReport.attackType || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="font-medium">{selectedReport.confidence}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                  <div className="font-medium">{selectedReport.processingTime}s</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Analysis Details</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Spectral Analysis: {selectedReport.details.spectralAnalysis}%</div>
                  <div>Temporal Consistency: {selectedReport.details.temporalConsistency}%</div>
                  <div>Neural Network Score: {selectedReport.details.neuralNetworkScore}%</div>
                  <div>Artifact Detection: {selectedReport.details.artifactDetection}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
