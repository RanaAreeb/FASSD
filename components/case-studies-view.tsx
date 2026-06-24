"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CASE_STUDIES_INTRO, REAL_WORLD_CASE_STUDIES } from "@/lib/case-studies"
import { FORENSIC_DISCLAIMER } from "@/lib/copy-safety"
import { testAudioFetchUrl } from "@/lib/test-audio-samples"
import { ExternalLink, FlaskConical, PlayCircle } from "lucide-react"

function AxisBlock({
  title,
  axis,
}: {
  title: string
  axis: (typeof REAL_WORLD_CASE_STUDIES)[number]["origin"] & { topSegments?: string }
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">FASSD result</p>
          <p className="font-medium">{axis.result}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Evidence band</p>
          <p className="font-medium">{axis.band}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Screening estimate</p>
          <p className="font-mono text-primary">{axis.screeningScore}</p>
        </div>
        {"topSegments" in axis && axis.topSegments ? (
          <div>
            <p className="text-muted-foreground text-xs mb-1">Top highlighted moments</p>
            <p className="font-mono text-xs leading-relaxed">{axis.topSegments}</p>
          </div>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{axis.interpretation}</p>
    </div>
  )
}

export function CaseStudiesView() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      <div className="mb-12 space-y-4">
        <Badge variant="outline" className="font-mono text-[10px]">
          RESEARCH DEMO
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-orbitron font-bold tracking-tight">
          {CASE_STUDIES_INTRO.title}
        </h1>
        <p className="text-muted-foreground leading-relaxed">{CASE_STUDIES_INTRO.whySelected}</p>
        <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-4 leading-relaxed">
          {CASE_STUDIES_INTRO.disclaimer}
        </p>
      </div>

      <div className="space-y-16">
        {REAL_WORLD_CASE_STUDIES.map((study, index) => (
          <article key={study.id} className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-mono text-muted-foreground">Case Study {index + 1}</p>
              <h2 className="text-2xl sm:text-3xl font-orbitron font-bold">{study.title}</h2>
              <p className="text-muted-foreground">{study.subtitle}</p>
            </div>

            <Card className="p-6 space-y-4 border-border/60">
              <h3 className="font-semibold">Case overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{study.overview}</p>
              <a
                href={study.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Public source (YouTube)
              </a>
            </Card>

            <Card className="p-6 space-y-3 border-border/60 bg-muted/10">
              <h3 className="font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                External forensic finding
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{study.externalFinding}</p>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">FASSD analysis result</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Audio tested</p>
                  <p className="font-mono">{study.audioFilename}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p>{study.durationLabel}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Test date</p>
                  <p>{study.testDate}</p>
                </div>
                <div className="rounded-lg border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">FASSD case ID</p>
                  <p className="font-mono text-xs">{study.caseId}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{study.sourceNote}</p>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={testAudioFetchUrl(study.audioPath)} download={study.audioFilename}>
                    Download test audio
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Analyze in lab
                  </Link>
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                <AxisBlock title="Voice source evidence" axis={study.origin} />
                <AxisBlock title="Recording chain evidence" axis={study.replay} />
                <AxisBlock title="Channel and mix evidence" axis={study.mixer} />
                <AxisBlock title="Edited segment evidence" axis={study.partial} />
              </div>
            </div>

            <Card className="p-6 space-y-3 border-primary/20 bg-primary/5">
              <h3 className="font-semibold">Comparison with external forensic analysis</h3>
              <p className="text-sm">
                <span className="text-muted-foreground">Agreement level: </span>
                <span className="font-medium">{study.agreementLevel}</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{study.comparisonSummary}</p>
              <p className="text-xs font-mono text-muted-foreground">Fusion status: {study.fusionStatus}</p>
            </Card>
          </article>
        ))}
      </div>

      <p className="mt-16 text-sm text-muted-foreground border-t border-border/60 pt-8 leading-relaxed">
        {CASE_STUDIES_INTRO.footerDisclaimer}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">{FORENSIC_DISCLAIMER}</p>
    </div>
  )
}
