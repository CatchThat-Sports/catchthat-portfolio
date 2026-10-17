export function HeroFootball() {
  return <svg viewBox="0 0 460 340" className="hero-football" aria-hidden="true">
    <defs>
      <radialGradient id="hf-leather" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#b8683a" />
        <stop offset="55%" stopColor="#8c4826" />
        <stop offset="100%" stopColor="#5e2d16" />
      </radialGradient>
      <linearGradient id="hf-streak" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f4b92a" stopOpacity="0" />
        <stop offset="100%" stopColor="#f4b92a" />
      </linearGradient>
    </defs>
    <g strokeLinecap="round" fill="none" stroke="url(#hf-streak)">
      <path d="M18 250 L150 214" strokeWidth="14" opacity=".9" />
      <path d="M54 296 L166 262" strokeWidth="10" opacity=".7" />
      <path d="M40 196 L132 172" strokeWidth="8" opacity=".5" />
    </g>
    <g transform="rotate(-28 270 170)">
      <path d="M120 170 C 175 70, 365 70, 420 170 C 365 270, 175 270, 120 170 Z" fill="url(#hf-leather)" stroke="#0b0b0b" strokeWidth="9" strokeLinejoin="round" />
      <path d="M150 170 C 200 98, 340 98, 390 170" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="5" strokeLinecap="round" />
      <path d="M210 128 Q 270 116 330 128" fill="none" stroke="#f1ece0" strokeWidth="6" strokeLinecap="round" />
      <g stroke="#f1ece0" strokeWidth="7" strokeLinecap="round">
        <path d="M226 113 L226 140" /><path d="M248 110 L248 137" /><path d="M270 109 L270 136" />
        <path d="M292 110 L292 137" /><path d="M314 113 L314 140" />
      </g>
    </g>
  </svg>;
}
