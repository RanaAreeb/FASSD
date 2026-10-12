import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { COMPANY } from "@/lib/company"
import { PROJECT } from "@/lib/project-facts"

export const metadata: Metadata = {
  title: `Privacy Policy · ${PROJECT.name}`,
  description: `Privacy policy for ${PROJECT.name} at ${COMPANY.domain}.`,
}

const LAST_UPDATED = "June 30, 2026"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <article className="pt-28 sm:pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose-invert">
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80 mb-3">Legal</p>
          <h1 className="text-4xl font-orbitron font-bold mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Who we are</h2>
              <p>
                {COMPANY.legalName} (&quot;we&quot;, &quot;us&quot;) operates the website and product at{" "}
                <span className="font-mono text-foreground">{COMPANY.domain}</span>. This policy explains how we
                handle information when you use our voice-integrity screening platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Information we collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="text-foreground">Account data:</span> email address, display name, and
                  authentication identifiers when you sign up (including via Google sign-in).
                </li>
                <li>
                  <span className="text-foreground">Audio uploads:</span> files or recordings you submit for
                  analysis. Uploads are processed to generate screening results and may be temporarily stored for
                  inference and report generation.
                </li>
                <li>
                  <span className="text-foreground">Usage data:</span> basic product usage such as analysis
                  history metadata (filename, timestamps, summary scores) when you are signed in and history saving
                  is enabled.
                </li>
                <li>
                  <span className="text-foreground">Technical data:</span> standard server and analytics logs
                  (for example IP address, browser type, page views) needed to operate and secure the service.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. How we use information</h2>
              <p>We use information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide multi-axis audio analysis and related reports</li>
                <li>Authenticate users and protect accounts</li>
                <li>Improve reliability, safety, and product quality</li>
                <li>Respond to support or partnership requests</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We do not sell personal data. Analysis outputs are experimental screening indicators and are not
                intended as legal or forensic certification.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Processors & infrastructure</h2>
              <p>
                Depending on configuration, we may use third-party services such as authentication/database
                providers (for example Firebase), cloud hosting, and optional speech-generation APIs used only in
                lab features you explicitly trigger. Audio and account data are processed under their respective
                terms and our operational controls.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Retention</h2>
              <p>
                Temporary inference files are deleted after processing where possible. Account profiles and optional
                analysis history remain until you delete them or request deletion. Server logs are retained for a
                limited operational period.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Your choices</h2>
              <p>
                You may access or update profile information in the product, stop using the service at any time, and
                request deletion of account-related data by emailing{" "}
                <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
                  {COMPANY.contactEmail}
                </a>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
              <p>
                We use industry-standard transport security (HTTPS), authentication controls, and server-side access
                restrictions for inference endpoints. No method of transmission or storage is perfectly secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Children</h2>
              <p>
                The service is not directed to children under 16. Do not submit personal data of children if you
                are not authorized to do so.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Changes</h2>
              <p>
                We may update this policy as the product evolves. Material changes will be reflected by updating the
                date above and, where appropriate, providing additional notice in the product.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
              <p>
                Privacy questions:{" "}
                <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
                  {COMPANY.contactEmail}
                </a>
              </p>
            </section>
          </div>

          <p className="mt-14 text-sm">
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
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
