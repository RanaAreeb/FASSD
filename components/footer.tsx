import Link from "next/link"
import { PROJECT } from "@/lib/project-facts"
import { COMPANY } from "@/lib/company"

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-8 bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <span className="font-orbitron font-black text-[10px] text-primary-foreground tracking-tight">
                  {PROJECT.logoMark}
                </span>
              </div>
              <span className="text-xl font-orbitron font-bold text-foreground">
                <span className="text-foreground">{PROJECT.namePrimary}</span>
                <span className="text-primary">{PROJECT.nameAccent}</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">{COMPANY.oneLiner}</p>
            <p className="text-sm">
              <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline font-mono text-xs">
                {COMPANY.contactEmail}
              </a>
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Live demo
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
                <Link href="/case-studies" className="hover:text-primary transition-colors">
                  Case studies
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href={`mailto:${COMPANY.contactEmail}`} className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/signin" className="hover:text-primary transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-semibold text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li className="text-xs leading-relaxed pt-1">
                Screening estimates only, not legal or forensic certification.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName} · {COMPANY.domain}
          </p>
          <p className="text-xs text-center sm:text-right max-w-md">{COMPANY.researchOrigin}</p>
        </div>
      </div>
    </footer>
  )
}
