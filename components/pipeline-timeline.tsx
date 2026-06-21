"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import {
  EASE_OUT_EXPO,
  pipelineContent,
  pipelineStepContainer,
  VIEWPORT_DEFAULT,
} from "@/lib/motion-presets"
import { PIPELINE_STEPS } from "@/lib/project-facts"
import { cn } from "@/lib/utils"

const NODE_LEFT = "left-[19px] sm:left-[23px]"
const NODE_SIZE = "h-10 w-10 sm:h-12 sm:w-12"

export function PipelineTimeline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.35"],
  })

  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const progressOpacity = useTransform(scrollYProgress, [0, 0.08, 1], [0, 1, 1])

  return (
    <motion.ol
      ref={listRef}
      className={cn("relative list-none m-0 p-0", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT_DEFAULT, amount: 0.15 }}
      variants={pipelineStepContainer}
    >
      <div
        className={cn("pointer-events-none absolute top-5 bottom-5 w-px bg-primary/10", NODE_LEFT)}
        aria-hidden
      />
      {!reduceMotion && (
        <motion.div
          className={cn(
            "pointer-events-none absolute top-5 w-px bg-gradient-to-b from-primary via-primary/80 to-primary/30",
            NODE_LEFT,
          )}
          style={{ height: progressHeight, opacity: progressOpacity }}
          aria-hidden
        />
      )}

      {PIPELINE_STEPS.map((step, index) => {
        const isLast = index === PIPELINE_STEPS.length - 1

        return (
          <motion.li key={step.step} className="relative" variants={pipelineContent}>
            <motion.div
              className="group relative flex gap-6 sm:gap-8 pb-12 last:pb-0"
              whileHover={reduceMotion ? undefined : { x: 4 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            >
              {!isLast && (
                <motion.span
                  className={cn("absolute top-12 bottom-0 w-px origin-top bg-primary/30", NODE_LEFT)}
                  aria-hidden
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.55, delay: 0.12, ease: EASE_OUT_EXPO }}
                />
              )}

              <div className="relative z-10 shrink-0">
                <span
                  className={cn(
                    "absolute -inset-1 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  )}
                  aria-hidden
                />
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full border-2 border-primary/40 bg-card font-mono text-xs sm:text-sm text-primary",
                    NODE_SIZE,
                    !reduceMotion &&
                      "group-hover:border-primary group-hover:shadow-[0_0_24px_oklch(0.65_0.25_260/0.35)] transition-[border-color,box-shadow] duration-300",
                  )}
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                  whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.55 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22, delay: index * 0.04 }}
                >
                  {step.step}
                </motion.div>
              </div>

              <div className="min-w-0 pt-1 sm:pt-2 pb-2">
                <h3 className="text-lg sm:text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg">{step.description}</p>
              </div>
            </motion.div>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
