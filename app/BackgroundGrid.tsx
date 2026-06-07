'use client';

import React from 'react';

export default function BackgroundGrid() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-[#0c0c0e]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Teal orb — centered top, like the glass sphere in reference */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(ellipse at 38% 32%,
            rgba(45,212,191,0.50) 0%,
            rgba(20,184,166,0.28) 20%,
            rgba(6,182,212,0.12) 45%,
            transparent 70%
          )`,
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Inner bright core */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full"
        style={{
          background: `radial-gradient(ellipse at 42% 36%,
            rgba(110,231,183,0.18) 0%,
            rgba(45,212,191,0.08) 50%,
            transparent 70%
          )`,
          filter: 'blur(10px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}
