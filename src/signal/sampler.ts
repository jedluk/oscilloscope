import { Channel, type ChannelParams } from "./channel";
import { applyLfos, type ChannelParamsByKey, type LfoParams } from "./lfo";

export const SEGMENT_BUDGET = 4096;

export interface SamplerInput {
  channels: ChannelParamsByKey;
  lfos: LfoParams[];
  is3d: boolean;
  dt: number;
}

/**
 * Traces the beam for one frame: advances the phase accumulators of the X/Y/Z
 * channels in fixed sub-steps and writes a fixed-size polyline into
 * `positions` (xyz per point). The point count never changes with frequency,
 * so GPU cost stays constant — at high frequencies the same budget just
 * covers fewer cycles, exactly like a real scope beam thinning out.
 */
export class BeamSampler {
  readonly positions = new Float32Array((SEGMENT_BUDGET + 1) * 3);
  private readonly chX = new Channel();
  private readonly chY = new Channel();
  private readonly chZ = new Channel();
  private lfoClock = 0;

  reset(): void {
    this.chX.reset();
    this.chY.reset();
    this.chZ.reset();
    this.lfoClock = 0;
  }

  sampleFrame(input: SamplerInput): Float32Array {
    const { channels, lfos, is3d, dt } = input;
    const n = SEGMENT_BUDGET;
    const subDt = dt / n;

    for (let i = 0; i <= n; i++) {
      const t = this.lfoClock + i * subDt;
      const modulated: ChannelParamsByKey = lfos.length > 0 ? applyLfos(channels, lfos, t) : channels;

      if (i > 0) {
        this.chX.advance(subDt, modulated.ch1.freq);
        this.chY.advance(subDt, modulated.ch2.freq);
        if (is3d) this.chZ.advance(subDt, modulated.ch3.freq);
      }

      const x = this.chX.sample(modulated.ch1);
      const y = this.chY.sample(modulated.ch2);
      const z = is3d ? this.chZ.sample(modulated.ch3) : 0;

      const o = i * 3;
      this.positions[o] = x;
      this.positions[o + 1] = y;
      this.positions[o + 2] = z;
    }

    this.lfoClock += dt;
    return this.positions;
  }
}

export type { ChannelParams };
