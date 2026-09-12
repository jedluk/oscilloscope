import { describe, expect, it } from "vitest";
import { applyLfos, defaultLfo, type ChannelParamsByKey } from "./lfo";
import { defaultChannelParams } from "./channel";

function baseChannels(): ChannelParamsByKey {
  return {
    ch1: defaultChannelParams({ freq: 100 }),
    ch2: defaultChannelParams({ freq: 200 }),
    ch3: defaultChannelParams({ freq: 300 }),
  };
}

describe("applyLfos", () => {
  it("returns the same reference when there are no lfos", () => {
    const channels = baseChannels();
    expect(applyLfos(channels, [], 0)).toBe(channels);
  });

  it("ignores disabled lfos", () => {
    const channels = baseChannels();
    const lfo = defaultLfo({ enabled: false, target: "ch1", param: "freq", depth: 500 });
    const out = applyLfos(channels, [lfo], 0);
    expect(out.ch1.freq).toBe(channels.ch1.freq);
  });

  it("modulates the targeted parameter and leaves others untouched", () => {
    const channels = baseChannels();
    const lfo = defaultLfo({ enabled: true, target: "ch2", param: "amp", waveform: "sine", rate: 1, depth: 0.5 });
    const out = applyLfos(channels, [lfo], 0.25); // sine(1*0.25) = 1 -> +0.5
    expect(out.ch2.amp).toBeCloseTo(channels.ch2.amp + 0.5);
    expect(out.ch1.freq).toBe(channels.ch1.freq);
    expect(out.ch3.freq).toBe(channels.ch3.freq);
  });

  it("clamps modulated frequency above zero", () => {
    const channels = baseChannels();
    const lfo = defaultLfo({ enabled: true, target: "ch1", param: "freq", waveform: "sine", rate: 1, depth: -1000 });
    const out = applyLfos(channels, [lfo], 0.25);
    expect(out.ch1.freq).toBeGreaterThan(0);
  });
});
