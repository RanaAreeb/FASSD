import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-8 bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-primary-foreground rounded-sm" />
              </div>
              <span className="text-xl font-orbitron font-bold text-foreground">FASSD</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Final-year project: Phase 9 multi-axis voice integrity checks, experimental forensic wording, and a
              Next.js + FastAPI demo stack.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-semibold text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Analysis lab
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="hover:text-primary transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/#pipeline" className="hover:text-primary transition-colors">
                  Pipeline
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-primary transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3 className="font-semibold text-sm">Repository</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>FYP code: FYP_FASSD-main</li>
              <li>Inference: inference_api</li>
              <li>Docs: PARTNER_INTEGRATION_GUIDE.md</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FASSD · Forensic Acoustics for Synthetic Speech Detection</p>
          <p className="text-xs text-center sm:text-right max-w-md">
            Model outputs are screening estimates — not legal or forensic certification.
          </p>
        </div>
      </div>
    </footer>
  )
}
