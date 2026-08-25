const STROKE = {
  stroke: "#211a2e",
  strokeWidth: 2.5,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Face({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function FaceStar({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path d="M28 42 Q22 12 50 12 Q78 12 72 42" {...STROKE} />
      <path d="M27 40 Q20 65 30 82 Q40 96 50 96 Q60 96 70 82 Q80 65 73 40" {...STROKE} />
      <circle cx="38" cy="52" r="4" {...STROKE} />
      <circle cx="62" cy="52" r="4" {...STROKE} />
      <path d="M40 74 Q50 80 60 74" {...STROKE} />
      <path
        d="M50 4 L52.5 9.5 L58.5 10 L54 14 L55.5 20 L50 17 L44.5 20 L46 14 L41.5 10 L47.5 9.5 Z"
        {...STROKE}
      />
    </Face>
  );
}

export function FaceCurly({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path
        d="M22 44 Q14 30 22 20 Q26 10 36 14 Q44 6 54 12 Q64 6 70 16 Q80 18 78 30 Q84 36 78 46"
        {...STROKE}
      />
      <path d="M25 42 Q20 66 32 84 Q42 98 50 98 Q58 98 68 84 Q80 66 75 42" {...STROKE} />
      <circle cx="37" cy="54" r="9" {...STROKE} />
      <circle cx="63" cy="54" r="9" {...STROKE} />
      <path d="M46 54 L54 54" {...STROKE} />
      <circle cx="37" cy="54" r="2.5" fill="#211a2e" />
      <circle cx="63" cy="54" r="2.5" fill="#211a2e" />
      <path d="M40 78 Q50 72 60 78 Q56 88 50 88 Q44 88 40 78 Z" {...STROKE} />
    </Face>
  );
}

export function FaceCap({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path d="M24 40 Q20 10 50 8 Q80 10 76 40" {...STROKE} />
      <path d="M20 26 Q50 14 80 26" {...STROKE} />
      <path d="M26 40 Q20 64 30 82 Q40 96 50 96 Q60 96 70 82 Q80 64 74 40" {...STROKE} />
      <ellipse cx="38" cy="52" rx="8" ry="6" {...STROKE} />
      <ellipse cx="62" cy="52" rx="8" ry="6" {...STROKE} />
      <path d="M46 52 L54 52" {...STROKE} />
      <path d="M38 62 Q50 70 62 62 L64 84 Q50 94 36 84 Z" {...STROKE} />
    </Face>
  );
}

export function FaceGrin({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path d="M28 44 Q24 14 50 12 Q76 14 72 44" {...STROKE} />
      <path d="M26 42 Q20 66 32 84 Q42 98 50 98 Q58 98 68 84 Q80 66 74 42" {...STROKE} />
      <circle cx="38" cy="52" r="7" {...STROKE} />
      <circle cx="62" cy="52" r="7" {...STROKE} />
      <path d="M46 52 L54 52" {...STROKE} />
      <path d="M38 70 Q50 82 62 70" {...STROKE} />
      <path d="M40 72 Q50 78 60 72" {...STROKE} />
    </Face>
  );
}

export function FaceWavy({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path
        d="M20 50 Q16 20 30 12 Q26 30 34 24 Q34 10 50 8 Q66 10 66 24 Q74 30 70 12 Q84 20 80 50"
        {...STROKE}
      />
      <path d="M24 44 Q18 68 30 86 Q40 100 50 100 Q60 100 70 86 Q82 68 76 44" {...STROKE} />
      <path d="M33 54 Q37 51 41 54" {...STROKE} />
      <path d="M59 54 Q63 51 67 54" {...STROKE} />
      <path d="M42 76 Q50 80 58 76" {...STROKE} />
      <circle cx="24" cy="70" r="2.5" {...STROKE} />
    </Face>
  );
}

export function FaceAfro({ className }: { className?: string }) {
  return (
    <Face className={className}>
      <path
        d="M50 6 Q78 6 82 32 Q90 38 84 50 Q86 60 76 60 Q70 40 50 38 Q30 40 24 60 Q14 60 16 50 Q10 38 18 32 Q22 6 50 6 Z"
        {...STROKE}
      />
      <path d="M27 46 Q22 68 33 86 Q42 99 50 99 Q58 99 67 86 Q78 68 73 46" {...STROKE} />
      <circle cx="38" cy="58" r="6" {...STROKE} />
      <circle cx="62" cy="58" r="6" {...STROKE} />
      <path d="M40 78 Q50 84 60 78" {...STROKE} />
      <circle cx="26" cy="74" r="2.5" {...STROKE} />
      <circle cx="74" cy="74" r="2.5" {...STROKE} />
    </Face>
  );
}
