import { describe, expect, it } from "vitest";
import { Channel, defaultChannelParams } from "./channel";
import { sine, square, triangle, saw } from "./waveforms";

describe("waveforms", () => {
  it("sine matches Math.sin at key phases", () => {
    expect(sine(0)).toBeCloseTo(0);
    expect(sine(0.25)).toBeCloseTo(1);
    expect(sine(0.5)).toBeCloseTo(0);
    expect(sine(0.75)).toBeCloseTo(-1);
  });

  it("square is bipolar with a 50% duty cycle", () => {
    expect(square(0)).toBe(1);
    expect(square(0.49)).toBe(1);
    expect(square(0.5)).toBe(-1);
    expect(square(0.99)).toBe(-1);
  });

  it("triangle peaks at phase 0, troughs at 0.5, crosses zero at 0.25/0.75", () => {
    expect(triangle(0)).toBeCloseTo(1);
    expect(triangle(0.25)).toBeCloseTo(0);
    expect(triangle(0.5)).toBeCloseTo(-1);
    expect(triangle(0.75)).toBeCloseTo(0);
  });

  it("saw ramps linearly from -1 to 1 across one period", () => {
    expect(saw(0)).toBeCloseTo(-1);
    expect(saw(0.5)).toBeCloseTo(0);
    expect(saw(0.999)).toBeCloseTo(1, 1);
  });
});

describe("Channel phase continuity", () => {
  it("never jumps discontinuously when freq changes mid-stream", () => {
    const ch = new Channel();
    const params = defaultChannelParams({ freq: 100 });
    const dt = 1 / 4096;

    let prevPhase = ch.currentPhase;
    for (let i = 0; i < 200; i++) {
      // freq changes every step, phase accumulator must still advance smoothly
      const freq = 50 + (i % 2) * 500;
      ch.advance(dt, freq);
      const delta = ch.currentPhase - prevPhase;
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThan(1); // no full-cycle skip within one tiny substep
      prevPhase = ch.currentPhase;
    }
    void params;
  });

  it("applies damping as an exponential envelope over elapsed time", () => {
    const ch = new Channel();
    const params = defaultChannelParams({ freq: 1, amp: 1, damping: 1 });
    ch.advance(1, params.freq); // 1 second elapsed
    const sample = ch.sample(params);
    // sin(2*pi*1) ~ 0, so check a phase offset instead for a clean magnitude read
    const params2 = defaultChannelParams({ freq: 1, amp: 1, damping: 1, phaseOffset: 0.25 });
    const s2 = ch.sample(params2);
    expect(Math.abs(s2)).toBeCloseTo(Math.exp(-1), 2);
    void sample;
  });

  it("reset zeroes phase and elapsed time", () => {
    const ch = new Channel();
    ch.advance(0.5, 10);
    expect(ch.currentPhase).toBeGreaterThan(0);
    ch.reset();
    expect(ch.currentPhase).toBe(0);
  });
});
