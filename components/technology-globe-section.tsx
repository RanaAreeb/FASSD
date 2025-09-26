"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";

const GlobeDemo = dynamic(() => import("./globe-demo"), {
  ssr: false,
});

export function TechnologyGlobeSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism border-glow">
                <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
                <span className="text-sm font-medium text-primary font-mono tracking-wider">
                  CUTTING-EDGE TECHNOLOGY
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-black text-gradient-primary leading-tight">
                The Science Behind Detection
              </h2>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Powered by breakthrough AI research and quantum-inspired algorithms
                in temporal modeling
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-morphism rounded-2xl p-6 border-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-background rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-orbitron">
                  Quantum Algorithms
                </h3>
                <p className="text-sm text-muted-foreground">
                  Advanced quantum-inspired processing for unprecedented accuracy
                </p>
              </div>

              <div className="glass-morphism rounded-2xl p-6 border-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500/70 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-background rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-orbitron">
                  Temporal Modeling
                </h3>
                <p className="text-sm text-muted-foreground">
                  Deep learning models trained on temporal audio patterns
                </p>
              </div>
            </div>
          </motion.div>

          {/* Globe Component */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden glass-morphism border-glow">
              <GlobeDemo />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
