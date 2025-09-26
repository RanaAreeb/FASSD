"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-morphism border-b border-border/30 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center glow-effect group-hover:scale-110 transition-all duration-300">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-background rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 animate-pulse"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-bold text-gradient-primary tracking-tight">DeepGuard</span>
                <div className="text-xs text-muted-foreground font-medium tracking-wider">AI DETECTION</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Technology", href: "#tech" },
                { name: "API", href: "#api" },
                { name: "Pricing", href: "#pricing" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-foreground/70 hover:text-primary transition-all duration-300 font-medium group"
                >
                  {item.name}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/signin" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-foreground/80 hover:text-primary hover:bg-primary/5 font-medium px-6 rounded-full transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 lg:px-8 py-2 lg:py-3 rounded-full glow-effect font-medium transition-all duration-300 hover:scale-105">
                  Get Started
                </Button>
              </Link>

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
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-morphism border-t border-border/30 mx-4 mb-4 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              {[
                { name: "Features", href: "#features" },
                { name: "Technology", href: "#tech" },
                { name: "API", href: "#api" },
                { name: "Pricing", href: "#pricing" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/30">
                <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full mb-2 rounded-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
