# Lissajous

An XY-mode CRT oscilloscope simulator that draws Lissajous curves — built as
a tribute to the classic lab exercise of tuning an analog scope by hand
(visual reference: Tektronix 475A).

![Lissajous scope screenshot](./docs/screenshot.png)

This isn't a function plot. The beam is physically simulated: brightness at
any point is inversely proportional to beam speed (slower = brighter, just
like a real tube), the image has phosphor persistence that decays
exponentially over time, plus bloom.

## Stack

- Vite + React + TypeScript
- three.js — a custom, multi-pass renderer (no `@react-three/fiber`): the
  beam is drawn as instanced segments in a shader, persistence is a
  ping-pong accumulation buffer, bloom is a separable gaussian blur,
  composited with a phosphor color ramp and graticule
- zustand — app state
- vitest — unit tests for the signal core

## Running it

Requires Node ≥20.19 or ≥22.12 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build   # production build
npm run test    # vitest
npm run lint    # oxlint
```

## How it works

- **CH1 / CH2** — two generators (X and Y): waveform (sine/triangle/square/
  saw), frequency, amplitude, phase, DC offset, envelope decay. The CH1:CH2
  frequency ratio and the phase difference (δ) between them determine the
  curve's shape.
- **Display** — Persist (trail length), Bright, Beam Width, Bloom/Glow Rad
  (phosphor glow), Hue (phosphor color), Grid, Clean (hides grid/vignette),
  3D (adds a Z channel and mouse-orbit view).
- **Modulation (LFO)** — modulators that can be routed onto any parameter of
  any channel (e.g. a slowly drifting frequency).
- **Presets** — classic frequency ratios (1:1, 1:2, 2:3, 3:4, 5:4). CH2 is
  intentionally detuned by a fraction of a percent so the pattern doesn't
  freeze on an exact frame lock — it slowly rotates/breathes, like a real
  pair of analog oscillators that are never perfectly in sync.
- **Export** — PNG (also bound to Cmd/Ctrl+S) and WebM recording.
- App state is encoded in the URL (`#s=...`) — the link is shareable.
- Knobs: drag vertically, arrow keys, double-click to reset to default, hold
  Shift for fine control.

The **?** button in the bottom-right corner opens an interactive walkthrough
of the panel.
