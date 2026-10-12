import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { COMPANY } from "@/lib/company"
import { PROJECT } from "@/lib/project-facts"

export const metadata: Metadata = {
  title: `Terms of Use · ${PROJECT.name}`,
  description: `Terms of use and product disclaimer for ${PROJECT.name}.`,
}

const LAST_UPDATED = "June 30, 2026"

export default function TermsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <article className="pt-28 sm:pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80 mb-3">Legal</p>
          <h1 className="text-4xl font-orbitron font-bold mb-3">Terms of Use</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance</h2>
              <p>
                By accessing {COMPANY.domain} or using {COMPANY.productName}, you agree to these Terms of Use and
                our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. The service</h2>
              <p>
                {COMPANY.productName} provides experimental multi-axis screening of audio for indicators related to
                synthetic speech, replay/rerecording, channel processing, and partial fabrication. Features may
                change as the platform develops.
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <h2 className="text-xl font-semibold text-foreground">3. Important disclaimer</h2>
              <p className="text-foreground/90">{COMPANY.disclaimer}</p>
              <p>
                Do not rely on this product as sole evidence in legal proceedings, employment decisions, or other
                high-stakes authenticity determinations without independent expert review.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Accounts</h2>
              <p>
                You are responsible for safeguarding your credentials and for activity under your account. Provide
                accurate registration information and use a verified email where required.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Acceptable use</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not upload content you are not authorized to process</li>
                <li>Do not attempt to disrupt, reverse-engineer, or abuse the inference API</li>
                <li>Do not use outputs to harass, defame, or unlawfully harm others</li>
                <li>Do not submit malware or non-audio payloads intended to compromise the service</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Intellectual property</h2>
              <p>
                The website, branding, software, and documentation remain the property of {COMPANY.legalName} and
                its licensors. You retain rights to audio you upload, subject to the limited license needed for us to
                process that audio and provide analysis results to you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Availability</h2>
              <p>
                The service is provided on an &quot;as available&quot; basis. We may suspend access for maintenance,
                security, or capacity reasons. Demo environments may have usage limits.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, {COMPANY.legalName} is not liable for indirect, incidental,
                special, consequential, or punitive damages, or for decisions made based on screening outputs. The
                total liability for any claim relating to the service is limited to the greater of fees you paid us
                in the prior three months (if any) or USD $50.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Changes</h2>
              <p>
                We may update these terms. Continued use after changes become effective constitutes acceptance of
                the revised terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
              <p>
                Questions about these terms:{" "}
                <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
                  {COMPANY.contactEmail}
                </a>
              </p>
            </section>
          </div>

          <p className="mt-14 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
          </p>
        </div>
      </article>
      <Footer />
    </main>
  )
}
