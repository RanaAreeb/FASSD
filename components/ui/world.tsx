"use client";
import React from "react";

interface WorldProps {
  data: any[];
  globeConfig: any;
}

export function World({ data, globeConfig }: WorldProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Simple animated globe representation */}
        <div className="w-96 h-96 rounded-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 border border-primary/30 animate-spin-slow">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-800/30 via-purple-800/30 to-cyan-800/30 border border-primary/20 animate-pulse">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-700/40 via-purple-700/40 to-cyan-700/40 border border-primary/10 animate-pulse delay-1000">
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
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-24 h-px bg-gradient-to-r from-primary to-transparent animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-20 h-px bg-gradient-to-l from-cyan-400 to-transparent animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-16 h-px bg-gradient-to-r from-blue-400 to-transparent animate-pulse delay-700"></div>
        </div>
      </div>
    </div>
  );
}
