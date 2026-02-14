"use client";
import React from "react";

export interface GlobeConfig {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Array<{
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
  }>;
}

export function World({ globeConfig, data }: WorldProps) {
  return (
    <div className="w-full h-full min-h-[280px] flex items-center justify-center p-4">
      <div className="relative w-full h-full min-h-[280px] flex items-center justify-center">
        {/* Responsive animated globe - smaller on mobile */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-cyan-500/40 border-2 border-primary/50 animate-spin-slow shrink-0">
          <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-blue-600/50 via-purple-600/50 to-cyan-600/50 border border-primary/40 animate-pulse">
            <div className="absolute inset-6 sm:inset-8 rounded-full bg-gradient-to-br from-blue-500/60 via-purple-500/60 to-cyan-500/60 border border-primary/30 animate-pulse">
              {/* Animated dots representing data points */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-700"></div>
              <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-500"></div>
              <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-200"></div>
            </div>
          </div>
        </div>

        {/* Animated connection lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-12 sm:w-24 h-px bg-gradient-to-r from-primary to-transparent animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-10 sm:w-20 h-px bg-gradient-to-l from-cyan-400 to-transparent animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-8 sm:w-16 h-px bg-gradient-to-r from-blue-400 to-transparent animate-pulse delay-700"></div>
        </div>
      </div>
    </div>
  );
}