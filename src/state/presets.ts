import { defaultChannelParams, type ChannelParams } from "../signal/channel";

export interface Preset {
  id: string;
  label: string;
  ratio: [number, number]; // ch1:ch2 frequency ratio
  deltaDeg: number; // phase difference in degrees
}

export const presets: Preset[] = [
  { id: "circle", label: "1:1  δ=90°  (okrąg)", ratio: [1, 1], deltaDeg: 90 },
  { id: "diagonal", label: "1:1  δ=0°  (linia)", ratio: [1, 1], deltaDeg: 0 },
  { id: "ellipse", label: "1:1  δ=45°  (elipsa)", ratio: [1, 1], deltaDeg: 45 },
  { id: "figure8", label: "1:2  δ=90°  (ósemka)", ratio: [1, 2], deltaDeg: 90 },
  { id: "trefoil", label: "2:3  δ=90°  (trójlistna pętla)", ratio: [2, 3], deltaDeg: 90 },
  { id: "pretzel", label: "3:4  δ=90°", ratio: [3, 4], deltaDeg: 90 },
  { id: "star", label: "5:4  δ=90°", ratio: [5, 4], deltaDeg: 90 },
];

const BASE_FREQ = 60;

export function presetToChannels(preset: Preset): { ch1: ChannelParams; ch2: ChannelParams } {
  const [a, b] = preset.ratio;
  return {
    ch1: defaultChannelParams({ freq: BASE_FREQ * a, phaseOffset: 0 }),
    ch2: defaultChannelParams({ freq: BASE_FREQ * b, phaseOffset: preset.deltaDeg / 360 }),
  };
}
