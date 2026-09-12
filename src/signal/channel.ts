import { waveforms, type WaveformId } from "./waveforms";

export interface ChannelParams {
  waveform: WaveformId;
  freq: number; // Hz
  amp: number; // 0..1
  phaseOffset: number; // 0..1, static offset added to accumulated phase
  dcOffset: number; // -1..1
  damping: number; // 0 = no decay, >0 = envelope decays over time (1/s)
}

export const defaultChannelParams = (overrides: Partial<ChannelParams> = {}): ChannelParams => ({
  waveform: "sine",
  freq: 220,
  amp: 1,
  phaseOffset: 0,
  dcOffset: 0,
  damping: 0,
  ...overrides,
});

/**
 * Holds a running phase accumulator so that live freq changes never
 * discontinuously jump the waveform (no audible/visual "click").
 */
export class Channel {
  private phase = 0;
  private elapsed = 0;

  advance(dt: number, freq: number): void {
    this.phase += dt * freq;
    if (this.phase > 1e6) this.phase -= Math.floor(this.phase);
    this.elapsed += dt;
  }

  reset(): void {
    this.phase = 0;
    this.elapsed = 0;
  }

  sample(params: ChannelParams): number {
    const wf = waveforms[params.waveform];
    const p = this.phase + params.phaseOffset;
    const envelope = params.damping > 0 ? Math.exp(-params.damping * this.elapsed) : 1;
    return wf(p) * params.amp * envelope + params.dcOffset;
  }

  get currentPhase(): number {
    return this.phase;
  }
}
