export type WaveformId = "sine" | "triangle" | "square" | "saw";

export type WaveformFn = (phase: number) => number;

const TAU = Math.PI * 2;

function wrap01(x: number): number {
  return x - Math.floor(x);
}

export const sine: WaveformFn = (phase) => Math.sin(TAU * phase);

export const triangle: WaveformFn = (phase) => {
  const p = wrap01(phase);
  return 4 * Math.abs(p - 0.5) - 1;
};

export const square: WaveformFn = (phase) => (wrap01(phase) < 0.5 ? 1 : -1);

export const saw: WaveformFn = (phase) => 2 * wrap01(phase) - 1;

export const waveforms: Record<WaveformId, WaveformFn> = {
  sine,
  triangle,
  square,
  saw,
};

export const waveformIds: WaveformId[] = ["sine", "triangle", "square", "saw"];
