import { waveforms, type WaveformId } from "./waveforms";
import type { ChannelParams } from "./channel";

export type ChannelKey = "ch1" | "ch2" | "ch3";
export type ModulatableParam = "freq" | "amp" | "phaseOffset" | "dcOffset";

export interface LfoParams {
  id: string;
  enabled: boolean;
  target: ChannelKey;
  param: ModulatableParam;
  waveform: WaveformId;
  rate: number; // Hz
  depth: number; // added to base value, same units as target param
}

export const defaultLfo = (overrides: Partial<LfoParams> = {}): LfoParams => ({
  id: Math.random().toString(36).slice(2),
  enabled: false,
  target: "ch1",
  param: "freq",
  waveform: "sine",
  rate: 0.5,
  depth: 0,
  ...overrides,
});

export type ChannelParamsByKey = Record<ChannelKey, ChannelParams>;

/**
 * Applies all enabled LFOs to a copy of the channel params, using a single
 * shared LFO clock `t` (seconds) so modulation is deterministic and
 * independent of frame rate.
 */
export function applyLfos(
  channels: ChannelParamsByKey,
  lfos: LfoParams[],
  t: number,
): ChannelParamsByKey {
  if (lfos.length === 0) return channels;

  const out: ChannelParamsByKey = {
    ch1: { ...channels.ch1 },
    ch2: { ...channels.ch2 },
    ch3: { ...channels.ch3 },
  };

  for (const lfo of lfos) {
    if (!lfo.enabled || lfo.depth === 0) continue;
    const wf = waveforms[lfo.waveform];
    const mod = wf(t * lfo.rate) * lfo.depth;
    const channel = out[lfo.target];
    channel[lfo.param] = channel[lfo.param] + mod;
  }

  // freq must never go negative/zero from modulation
  out.ch1.freq = Math.max(0.001, out.ch1.freq);
  out.ch2.freq = Math.max(0.001, out.ch2.freq);
  out.ch3.freq = Math.max(0.001, out.ch3.freq);

  return out;
}
