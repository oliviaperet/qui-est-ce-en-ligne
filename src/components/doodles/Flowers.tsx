const PETAL = {
  stroke: "#c4157a",
  strokeWidth: 2,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FlowerFive({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g transform="translate(30,26)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="0" cy="-13" rx="8" ry="12" transform={`rotate(${deg})`} {...PETAL} />
        ))}
        <circle r="4" {...PETAL} />
      </g>
      <path d="M30 46 L30 60" {...PETAL} />
    </svg>
  );
}

export function FlowerDaisy({ className }: { className?: string }) {
  const petals = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <svg viewBox="0 0 60 70" className={className} aria-hidden="true">
      <g transform="translate(30,26)">
        {petals.map((deg) => (
          <line key={deg} x1="0" y1="-4" x2="0" y2="-22" transform={`rotate(${deg})`} {...PETAL} />
        ))}
        <circle r="4" fill="#c4157a" stroke="none" />
      </g>
      <path d="M30 48 Q26 58 18 60" {...PETAL} />
      <path d="M30 44 L30 68" {...PETAL} />
    </svg>
  );
}

export function FlowerSpiky({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g transform="translate(30,24)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path key={deg} d="M0 -2 L4 -20 L0 -14 L-4 -20 Z" transform={`rotate(${deg})`} {...PETAL} />
        ))}
      </g>
      <path d="M30 44 L30 60" {...PETAL} />
      <path d="M30 50 Q22 54 16 50" {...PETAL} />
    </svg>
  );
}
