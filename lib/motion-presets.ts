/** Shared Motion easing + variants for consistent site animations. */

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const
export const EASE_OUT_SOFT = [0.25, 0.46, 0.45, 0.94] as const

export const VIEWPORT_DEFAULT = {
  once: true,
  margin: "-10% 0px -8% 0px",
  amount: 0.2,
} as const

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
}

export const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0.06) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

export const heroTitle = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
}

export const heroPanel = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export const timelineStep = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
}

export const pipelineStepContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
}

export const pipelineNode = {
  hidden: { scale: 0.55, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
}

export const pipelineContent = {
  hidden: { opacity: 0, y: 22, x: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
}

export const pipelineConnector = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
}

export const pipelineAsideItem = {
  hidden: { opacity: 0, x: -28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
}

export const pipelineAsideContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

export const reducedMotionTransition = { duration: 0.01 }
