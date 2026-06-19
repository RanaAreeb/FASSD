"use client"

import type React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"
import {
  EASE_OUT_EXPO,
  EASE_OUT_SOFT,
  fadeIn,
  fadeLeft,
  fadeRight,
  fadeUp,
  reducedMotionTransition,
  scaleIn,
  staggerContainer,
  VIEWPORT_DEFAULT,
} from "@/lib/motion-presets"
import { cn } from "@/lib/utils"
import { useMotionReady } from "./motion-ready-context"

type RevealDirection = "up" | "left" | "right" | "scale" | "fade"

const variantMap = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
  scale: scaleIn,
  fade: fadeIn,
}

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: RevealDirection
  duration?: number
  as?: keyof typeof motion
} & Omit<HTMLMotionProps<"div">, "children">

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.65,
  as = "div",
  ...rest
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] as typeof motion.div

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_DEFAULT}
      variants={variantMap[direction]}
      transition={
        reduceMotion
          ? reducedMotionTransition
          : { duration, delay, ease: EASE_OUT_EXPO }
      }
      {...rest}
    >
      {children}
    </Component>
  )
}

type RevealStaggerProps = {
  children: React.ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
  as?: keyof typeof motion
}

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  as = "div",
}: RevealStaggerProps) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] as typeof motion.div

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_DEFAULT}
      variants={staggerContainer(stagger, delayChildren)}
      transition={reduceMotion ? reducedMotionTransition : undefined}
    >
      {children}
    </Component>
  )
}

type RevealItemProps = {
  children: React.ReactNode
  className?: string
  direction?: RevealDirection
  variants?: typeof fadeUp
  as?: keyof typeof motion
}

export function RevealItem({
  children,
  className,
  direction = "up",
  variants,
  as = "div",
}: RevealItemProps) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] as typeof motion.div

  return (
    <Component
      className={className}
      variants={variants ?? variantMap[direction]}
      transition={reduceMotion ? reducedMotionTransition : { duration: 0.55, ease: EASE_OUT_SOFT }}
    >
      {children}
    </Component>
  )
}

/** Hero-only: animates when motion system is ready (after loading screen). */
export function HeroReveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variants?: typeof fadeUp
}) {
  const reduceMotion = useReducedMotion()
  const ready = useMotionReady()

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={variants}
      transition={
        reduceMotion
          ? reducedMotionTransition
          : { duration: 0.75, delay, ease: EASE_OUT_EXPO }
      }
    >
      {children}
    </motion.div>
  )
}
