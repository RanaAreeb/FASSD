"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "motion/react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useMotionReady } from "@/components/motion-ready-context"
import { EASE_OUT_EXPO } from "@/lib/motion-presets"
import { PROJECT } from "@/lib/project-facts"

const HOME_NAV_LINKS = [
  { name: "Architecture", href: "/#architecture" },
  { name: "Pipeline", href: "/#pipeline" },
  { name: "Features", href: "/#features" },
  { name: "Use cases", href: "/#use-cases" },
  { name: "Case studies", href: "/case-studies" },
]

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className={`w-9 h-9 ${className ?? ""}`} />
  const isDark = resolvedTheme === "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 flex items-center justify-center rounded-full border border-border/50 bg-background/60 hover:bg-accent hover:border-primary/40 transition-all duration-300 ${className ?? ""}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-primary" />
      ) : (
        <Moon className="w-4 h-4 text-primary" />
      )}
    </button>
  )
}

export function Navigation() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isDashboardOrProfile = pathname === "/dashboard" || pathname === "/profile"
  const showHomeNavLinks = mounted && !isDashboardOrProfile

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const showLoggedInNav = mounted && !!user
  const motionReady = useMotionReady()

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={motionReady ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-morphism border-b border-border/30 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-2xl flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_oklch(0.65_0.25_260/0.25)]">
                  <span className="font-orbitron font-black text-[11px] lg:text-xs text-primary-foreground tracking-tight leading-none">
                    {PROJECT.logoMark}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <span className="block text-base sm:text-xl lg:text-2xl font-bold font-orbitron tracking-tight leading-tight truncate">
                  <span className="text-foreground">{PROJECT.namePrimary}</span>
                  <span className="text-primary">{PROJECT.nameAccent}</span>
                </span>
              </div>
            </Link>

            {showHomeNavLinks && (
              <div className="hidden lg:flex items-center gap-8">
                {HOME_NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative text-foreground/70 hover:text-primary transition-all duration-300 font-medium group"
                  >
                    {item.name}
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {showLoggedInNav ? (
                <>
                  <Link href="/dashboard" className="hidden sm:block">
                    <Button
                      variant="ghost"
                      className="text-foreground/80 hover:text-primary hover:bg-primary/5 font-medium px-4 sm:px-6 rounded-full transition-all duration-300"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile" className="hidden sm:block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 lg:px-8 py-2 rounded-full glow-effect font-medium transition-all duration-300 hover:scale-105">
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin" className="hidden sm:block">
                    <Button
                      variant="ghost"
                      className="text-foreground/80 hover:text-primary hover:bg-primary/5 font-medium px-4 sm:px-6 rounded-full transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="hidden sm:block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 lg:px-8 py-2 rounded-full glow-effect font-medium transition-all duration-300 hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                  <div
                    className={`w-full h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                  ></div>
                  <div
                    className={`w-full h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                  ></div>
                  <div
                    className={`w-full h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                  ></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "max-h-[calc(100dvh-4rem)] opacity-100 overflow-y-auto overscroll-contain"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="glass-morphism border-t border-border/30 mx-3 mt-1 mb-6 rounded-2xl p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex flex-col gap-0.5">
              {showHomeNavLinks && HOME_NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-medium py-2.5 px-2 rounded-xl hover:bg-primary/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className={`flex flex-col gap-2 ${showHomeNavLinks ? "pt-3 mt-2 border-t border-border/30" : ""}`}>
                <div className="flex items-center justify-between px-1 py-1.5">
                  <span className="text-sm text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                {showLoggedInNav ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full rounded-full justify-center">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full rounded-full justify-center glow-effect">
                        Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full rounded-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full rounded-full justify-center glow-effect">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}
