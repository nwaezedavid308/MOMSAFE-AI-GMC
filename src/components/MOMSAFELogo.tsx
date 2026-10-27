import React from "react";

interface MOMSAFELogoProps {
  className?: string;
  size?: number;
  withBackground?: boolean;
}

export default function MOMSAFELogo({ className = "", size = 48, withBackground = true }: MOMSAFELogoProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      id="momsafe-logo"
    >
      {/* Deep Purple background card if specified */}
      {withBackground && (
        <div className="absolute inset-0 bg-[#32134F] rounded-2xl border border-white/10 shadow-lg overflow-hidden" />
      )}

      {/* High-fidelity Custom SVG Logo inspired by b79b23 */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10 w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft radial purple glow inside logo */}
        <defs>
          <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#32134F" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="butterfly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8B4FE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          <linearGradient id="flower-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E879F9" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        {withBackground && (
          <circle cx="50" cy="50" r="45" fill="url(#logo-glow)" />
        )}

        {/* --- FLOWERS AND LEAVES ON LEFT AND RIGHT --- */}
        {/* Left main flower (purple-pink) */}
        <path
          d="M 28 60 C 23 55, 23 65, 28 60 Z"
          fill="url(#flower-grad)"
          opacity="0.85"
        />
        <path
          d="M 28 60 C 25 51, 33 51, 28 60 Z"
          fill="url(#flower-grad)"
          opacity="0.9"
        />
        <path
          d="M 28 60 C 34 56, 34 64, 28 60 Z"
          fill="url(#flower-grad)"
          opacity="0.85"
        />
        <path
          d="M 28 60 C 31 69, 23 69, 28 60 Z"
          fill="url(#flower-grad)"
          opacity="0.9"
        />
        <circle cx="28" cy="60" r="2" fill="#FDE047" /> {/* Flower center yellow */}

        {/* Right lavender sprigs / small flower buds */}
        <circle cx="68" cy="45" r="2.5" fill="#C084FC" opacity="0.9" />
        <circle cx="72" cy="48" r="2" fill="#D8B4FE" opacity="0.8" />
        <circle cx="65" cy="52" r="2" fill="#A855F7" opacity="0.9" />
        <circle cx="69" cy="55" r="2.5" fill="#C084FC" />
        <circle cx="73" cy="58" r="1.5" fill="#E879F9" opacity="0.85" />
        <circle cx="66" cy="62" r="2" fill="#D8B4FE" />

        {/* Green leaves trailing down right side */}
        <path
          d="M 68 53 Q 73 50 78 54 Q 72 56 68 53"
          fill="#4ADE80"
          opacity="0.8"
        />
        <path
          d="M 70 60 Q 75 64 77 71 Q 71 67 70 60"
          fill="#22C55E"
          opacity="0.85"
        />
        <path
          d="M 64 64 Q 61 70 56 74 Q 60 68 64 64"
          fill="#15803D"
          opacity="0.7"
        />

        {/* --- MAIN HEART IN THE CENTER --- */}
        {/* Crisp White Heart Outline with gap or layered */}
        <path
          d="M 50 35 C 44 26, 26 26, 26 44 C 26 56, 40 68, 50 78 C 60 68, 74 56, 74 44 C 74 26, 56 26, 50 35 Z"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* --- HEARTBEAT ECG PULSE LINE INSIDE --- */}
        <path
          d="M 28 47 H 41 L 45 36 L 50 56 L 54 42 L 57 49 H 72"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* --- BUTTERFLIES --- */}
        {/* Top Left Butterfly */}
        <g transform="translate(42, 28) rotate(-15) scale(0.85)">
          {/* Wings */}
          <path d="M0 0 C-4 -6, -10 -4, -4 2 Z" fill="url(#butterfly-grad)" />
          <path d="M0 0 C-6 2, -6 8, -1 4 Z" fill="url(#butterfly-grad)" opacity="0.8" />
          <path d="M0 0 C4 -5, 8 -3, 3 2 Z" fill="url(#butterfly-grad)" />
          <path d="M0 0 C5 2, 5 7, 1 4 Z" fill="url(#butterfly-grad)" opacity="0.8" />
          {/* Body */}
          <line x1="0" y1="-3" x2="0" y2="4" stroke="#FFFFFF" strokeWidth="1" />
        </g>

        {/* Top Right Butterfly */}
        <g transform="translate(58, 35) rotate(20) scale(0.7)">
          {/* Wings */}
          <path d="M0 0 C-4 -6, -10 -4, -4 2 Z" fill="url(#butterfly-grad)" />
          <path d="M0 0 C-6 2, -6 8, -1 4 Z" fill="url(#butterfly-grad)" opacity="0.8" />
          <path d="M0 0 C4 -5, 8 -3, 3 2 Z" fill="url(#butterfly-grad)" />
          <path d="M0 0 C5 2, 5 7, 1 4 Z" fill="url(#butterfly-grad)" opacity="0.8" />
          {/* Body */}
          <line x1="0" y1="-3" x2="0" y2="4" stroke="#FFFFFF" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
