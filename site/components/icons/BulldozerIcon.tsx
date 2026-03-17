export function BulldozerIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="28" width="8" height="20" rx="2" fill="#ef4444"/>
      <rect x="2" y="26" width="10" height="4" rx="1" fill="#dc2626"/>
      <rect x="10" y="24" width="30" height="16" rx="3" fill="#dc2626"/>
      <rect x="28" y="14" width="14" height="14" rx="2" fill="#b91c1c"/>
      <rect x="30" y="16" width="10" height="8" rx="1" fill="#fca5a5"/>
      <rect x="22" y="18" width="3" height="8" rx="1" fill="#991b1b"/>
      <rect x="10" y="42" width="34" height="12" rx="6" fill="#7f1d1d"/>
      <circle cx="17" cy="48" r="4" fill="#991b1b"/>
      <circle cx="27" cy="48" r="4" fill="#991b1b"/>
      <circle cx="37" cy="48" r="4" fill="#991b1b"/>
      <rect x="8" y="30" width="6" height="3" fill="#b91c1c"/>
    </svg>
  );
}

export function BulldozerLogoIcon({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Body paint */}
        <linearGradient id="bodyPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a500"/>
          <stop offset="40%" stopColor="#d4960a"/>
          <stop offset="100%" stopColor="#b07d08"/>
        </linearGradient>
        <linearGradient id="bodyDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c48a08"/>
          <stop offset="100%" stopColor="#8b6508"/>
        </linearGradient>
        {/* Blade */}
        <linearGradient id="bladeFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1a1a"/>
          <stop offset="20%" stopColor="#333"/>
          <stop offset="80%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#111"/>
        </linearGradient>
        <linearGradient id="bladeTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#444"/>
          <stop offset="100%" stopColor="#222"/>
        </linearGradient>
        {/* Metal */}
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b6b6b"/>
          <stop offset="50%" stopColor="#555"/>
          <stop offset="100%" stopColor="#3a3a3a"/>
        </linearGradient>
        <linearGradient id="darkSteel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3a"/>
          <stop offset="100%" stopColor="#1a1a1a"/>
        </linearGradient>
        {/* Track rubber */}
        <linearGradient id="trackRubber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#111"/>
        </linearGradient>
        {/* Glass */}
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ba3d6"/>
          <stop offset="30%" stopColor="#4a8ec4"/>
          <stop offset="70%" stopColor="#3a7ab0"/>
          <stop offset="100%" stopColor="#2d6a9f"/>
        </linearGradient>
        {/* Shadow */}
        <filter id="shadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* === GROUND SHADOW === */}
      <ellipse cx="55" cy="84" rx="50" ry="4" fill="#000" opacity="0.12"/>

      {/* === TRACKS === */}
      <path d="M20 62 Q20 80 34 80 L86 80 Q100 80 100 62 L100 56 Q100 44 86 44 L34 44 Q20 44 20 56 Z" fill="url(#trackRubber)"/>
      {/* Inner track */}
      <path d="M24 62 Q24 76 35 76 L85 76 Q96 76 96 62 L96 56 Q96 48 85 48 L35 48 Q24 48 24 56 Z" fill="#1a1a1a"/>
      {/* Track pads bottom */}
      <rect x="28" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="37" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="46" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="55" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="64" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="73" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      <rect x="82" y="76" width="6" height="4" rx="0.5" fill="#0a0a0a"/>
      {/* Front idler */}
      <circle cx="34" cy="62" r="9" fill="url(#darkSteel)"/>
      <circle cx="34" cy="62" r="6.5" fill="#2a2a2a"/>
      <circle cx="34" cy="62" r="3" fill="url(#steel)"/>
      <circle cx="34" cy="62" r="1.5" fill="#222"/>
      {/* Rear sprocket */}
      <circle cx="86" cy="62" r="9" fill="url(#darkSteel)"/>
      <circle cx="86" cy="62" r="6.5" fill="#2a2a2a"/>
      <circle cx="86" cy="62" r="3" fill="url(#steel)"/>
      <circle cx="86" cy="62" r="1.5" fill="#222"/>
      {/* Mid rollers */}
      <circle cx="50" cy="62" r="6" fill="url(#darkSteel)"/>
      <circle cx="50" cy="62" r="3.5" fill="#2a2a2a"/>
      <circle cx="50" cy="62" r="1.5" fill="url(#steel)"/>
      <circle cx="60" cy="62" r="6" fill="url(#darkSteel)"/>
      <circle cx="60" cy="62" r="3.5" fill="#2a2a2a"/>
      <circle cx="60" cy="62" r="1.5" fill="url(#steel)"/>
      <circle cx="70" cy="62" r="6" fill="url(#darkSteel)"/>
      <circle cx="70" cy="62" r="3.5" fill="#2a2a2a"/>
      <circle cx="70" cy="62" r="1.5" fill="url(#steel)"/>
      {/* Track guard / fender */}
      <rect x="22" y="42" width="76" height="5" rx="1.5" fill="url(#bodyPaint)" filter="url(#shadow)"/>

      {/* === ENGINE BODY === */}
      <rect x="24" y="22" width="36" height="24" rx="2" fill="url(#bodyPaint)" filter="url(#shadow)"/>
      {/* Hood top bevel */}
      <rect x="24" y="22" width="36" height="4" rx="2" fill="#e8a500"/>
      {/* Side panel seam */}
      <line x1="24" y1="36" x2="60" y2="36" stroke="#9a7a06" strokeWidth="0.5" opacity="0.6"/>
      {/* Grille area */}
      <rect x="27" y="28" width="20" height="14" rx="2" fill="#1a1a1a"/>
      {/* Grille bars */}
      <rect x="29" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      <rect x="32" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      <rect x="35" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      <rect x="38" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      <rect x="41" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      <rect x="44" y="29.5" width="1.5" height="11" rx="0.5" fill="#333"/>
      {/* Grille mesh highlight */}
      <rect x="28" y="30" width="18" height="0.5" fill="#555" opacity="0.3"/>
      <rect x="28" y="33" width="18" height="0.5" fill="#555" opacity="0.3"/>
      <rect x="28" y="36" width="18" height="0.5" fill="#555" opacity="0.3"/>
      <rect x="28" y="39" width="18" height="0.5" fill="#555" opacity="0.3"/>

      {/* === EXHAUST === */}
      <rect x="52" y="6" width="5" height="20" rx="2.5" fill="url(#steel)"/>
      <ellipse cx="54.5" cy="5" rx="4" ry="2" fill="#555"/>
      <ellipse cx="54.5" cy="5" rx="2.5" ry="1" fill="#333"/>

      {/* === CAB === */}
      <rect x="62" y="6" width="32" height="40" rx="3" fill="url(#bodyDark)" filter="url(#shadow)"/>
      {/* Cab top */}
      <rect x="60" y="3" width="36" height="6" rx="3" fill="#8b6508"/>
      <rect x="60" y="3" width="36" height="3" rx="2" fill="#9a7a06"/>
      {/* Rear pillar */}
      <rect x="90" y="6" width="5" height="40" rx="1" fill="#8b6508"/>
      {/* Front pillar */}
      <rect x="62" y="6" width="4" height="40" rx="1" fill="#9a7a06"/>
      {/* Window */}
      <rect x="66" y="10" width="22" height="20" rx="2" fill="url(#glass)"/>
      {/* Glass reflection streak */}
      <path d="M68 10 L78 10 Q79 10 79 11 L68 22 L67 22 Q66 22 66 21 L66 12 Q66 10 68 10 Z" fill="white" opacity="0.15"/>
      {/* Window mullion */}
      <rect x="76.5" y="10" width="2" height="20" fill="#8b6508"/>
      {/* Side window lower panel */}
      <rect x="66" y="32" width="22" height="10" rx="1" fill="#a08210"/>
      {/* Door seam */}
      <line x1="76" y1="32" x2="76" y2="42" stroke="#8b6508" strokeWidth="0.5"/>
      {/* Door handle */}
      <rect x="70" y="36" width="4" height="1.5" rx="0.75" fill="#6b6b6b"/>

      {/* === BLADE === */}
      <path d="M4 26 Q2 24 2 28 L2 60 Q2 62 4 62 L18 62 L18 26 Z" fill="url(#bladeFace)" filter="url(#shadow)"/>
      {/* Blade top cap */}
      <rect x="0" y="22" width="20" height="5" rx="1.5" fill="url(#bladeTop)"/>
      {/* Cutting edge */}
      <rect x="1" y="60" width="18" height="4" rx="0.5" fill="#555"/>
      <rect x="1" y="62" width="18" height="2" rx="0.5" fill="#333"/>
      {/* Blade structural ribs */}
      <rect x="5" y="28" width="2.5" height="31" rx="0.5" fill="#2a2a2a"/>
      <rect x="12" y="28" width="2.5" height="31" rx="0.5" fill="#2a2a2a"/>
      {/* Rib highlights */}
      <rect x="5" y="28" width="1" height="31" rx="0.5" fill="#444" opacity="0.4"/>
      <rect x="12" y="28" width="1" height="31" rx="0.5" fill="#444" opacity="0.4"/>

      {/* === PUSH FRAME === */}
      <path d="M18 34 L26 30 L26 34 L18 38 Z" fill="url(#steel)"/>
      <path d="M18 46 L26 42 L26 46 L18 50 Z" fill="url(#steel)"/>
      {/* Hydraulic cylinders */}
      <rect x="19" y="32" width="6" height="2.5" rx="1.25" fill="#888"/>
      <rect x="21" y="32.5" width="4" height="1.5" rx="0.75" fill="#aaa"/>
      <rect x="19" y="44.5" width="6" height="2.5" rx="1.25" fill="#888"/>
      <rect x="21" y="45" width="4" height="1.5" rx="0.75" fill="#aaa"/>

      {/* === DETAILS === */}
      {/* Headlight */}
      <circle cx="26" cy="28" r="2.5" fill="#fbbf24"/>
      <circle cx="26" cy="28" r="1.5" fill="#fef3c7"/>
      <circle cx="26" cy="28" r="0.8" fill="white" opacity="0.7"/>
      {/* Rear light */}
      <rect x="92" y="34" width="3" height="5" rx="1" fill="#dc2626"/>
      <rect x="92.5" y="34.5" width="2" height="2" rx="0.5" fill="#ef4444" opacity="0.7"/>
      {/* Tow hook */}
      <path d="M96 44 Q100 44 100 48 L100 50 Q100 52 98 52 L96 52" stroke="url(#steel)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
