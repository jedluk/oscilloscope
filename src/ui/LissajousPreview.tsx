const SAMPLES = 120;

/**
 * For integer a:b, sin(a·t) and sin(b·t) both complete a whole number of
 * cycles by t = 2π, so the curve always closes exactly over t ∈ [0, 2π) —
 * no need to hunt for the true period via gcd/lcm.
 */
function buildPath(a: number, b: number, deltaRad: number, size: number, pad: number): string {
  const r = (size - pad * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  let d = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;
    const x = cx + Math.sin(a * t) * r;
    const y = cy + Math.sin(b * t + deltaRad) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d;
}

export function LissajousPreview({
  ratio,
  deltaDeg,
  size = 28,
}: {
  ratio: [number, number];
  deltaDeg: number;
  size?: number;
}) {
  const path = buildPath(ratio[0], ratio[1], (deltaDeg * Math.PI) / 180, size, 3);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
