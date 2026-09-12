import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { defaultChannelParams, type ChannelParams } from "../signal/channel";
import { defaultLfo, type LfoParams } from "../signal/lfo";

export interface DisplayParams {
  persistenceTau: number; // seconds, exponential decay time constant
  bloomStrength: number;
  bloomRadius: number;
  brightness: number; // beam gain
  beamWidth: number; // pixels
  gridBrightness: number;
  phosphorHue: number; // 0..1
  cleanMode: boolean; // disables grid/vignette/glass overlays
}

export const defaultDisplayParams = (): DisplayParams => ({
  persistenceTau: 0.1,
  bloomStrength: 0.8,
  bloomRadius: 0.4,
  brightness: 1.0,
  beamWidth: 2.2,
  gridBrightness: 0.35,
  phosphorHue: 0.5,
  cleanMode: false,
});

export interface ScopeState {
  ch1: ChannelParams;
  ch2: ChannelParams;
  ch3: ChannelParams;
  lfos: LfoParams[];
  display: DisplayParams;
  is3d: boolean;

  setChannel: (key: "ch1" | "ch2" | "ch3", patch: Partial<ChannelParams>) => void;
  setDisplay: (patch: Partial<DisplayParams>) => void;
  setIs3d: (v: boolean) => void;
  addLfo: () => void;
  removeLfo: (id: string) => void;
  updateLfo: (id: string, patch: Partial<LfoParams>) => void;
  applyPreset: (patch: Partial<Pick<ScopeState, "ch1" | "ch2" | "ch3">>) => void;
  loadState: (state: Partial<SerializableScopeState>) => void;
}

export interface SerializableScopeState {
  ch1: ChannelParams;
  ch2: ChannelParams;
  ch3: ChannelParams;
  lfos: LfoParams[];
  display: DisplayParams;
  is3d: boolean;
}

export const useScopeStore = create<ScopeState>()(
  subscribeWithSelector((set) => ({
    ch1: defaultChannelParams({ freq: 60 }),
    // Slightly detuned from CH1 (see presets.ts DETUNE) so the default
    // circle isn't perfectly frame-locked and gently breathes over time.
    ch2: defaultChannelParams({ freq: 60.108, phaseOffset: 0.25 }),
    ch3: defaultChannelParams({ freq: 40, amp: 0.6 }),
    lfos: [],
    display: defaultDisplayParams(),
    is3d: false,

    setChannel: (key, patch) =>
      set((s) => ({ [key]: { ...s[key], ...patch } }) as Partial<ScopeState>),

    setDisplay: (patch) => set((s) => ({ display: { ...s.display, ...patch } })),

    setIs3d: (v) => set({ is3d: v }),

    addLfo: () => set((s) => ({ lfos: [...s.lfos, defaultLfo()] })),

    removeLfo: (id) => set((s) => ({ lfos: s.lfos.filter((l) => l.id !== id) })),

    updateLfo: (id, patch) =>
      set((s) => ({
        lfos: s.lfos.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      })),

    applyPreset: (patch) => set((s) => ({ ...s, ...patch })),

    loadState: (state) => set((s) => ({ ...s, ...state })),
  })),
);

export function getSerializableState(s: ScopeState): SerializableScopeState {
  return { ch1: s.ch1, ch2: s.ch2, ch3: s.ch3, lfos: s.lfos, display: s.display, is3d: s.is3d };
}
