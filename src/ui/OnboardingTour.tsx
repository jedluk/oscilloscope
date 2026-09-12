import { useEffect, useLayoutEffect, useState } from "react";
import styles from "./OnboardingTour.module.css";

interface TourStep {
  target: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    target: "screen",
    title: "CRT screen",
    body: "The beam traces a Lissajous curve from the X (CH1) and Y (CH2) signals. The slower it moves at a given point, the brighter it glows — just like a real oscilloscope tube.",
  },
  {
    target: "ch1",
    title: "CH1 — X channel",
    body: "Frequency, waveform, phase and amplitude of the horizontal axis. Knobs: drag vertically, arrow keys ↑↓←→, double-click to reset, hold Shift for fine control.",
  },
  {
    target: "ch2",
    title: "CH2 — Y channel",
    body: "The CH1:CH2 ratio determines the shape (1:1 = ellipse/circle, 1:2 = figure-eight, 3:4, 5:4...). The phase (δ) between channels \"opens\" the curve.",
  },
  {
    target: "display",
    title: "Screen look",
    body: "Persist = how long the beam trail glows. Bloom/Glow Rad = phosphor glow. Clean hides the grid and vignette. 3D adds a third channel (Z) and a mouse-orbit view.",
  },
  {
    target: "presets",
    title: "Presets",
    body: "Ready-made classic Lissajous ratios — click one to see the effect instantly instead of dialing it in by hand.",
  },
  {
    target: "export",
    title: "Export",
    body: "PNG saves the current frame, REC WebM records a video of the screen. Cmd/Ctrl+S is also bound to PNG export.",
  },
];

const SEEN_KEY = "lissajous-tour-seen";
const MARGIN = 8;

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // ignore, e.g. storage blocked
    }
    if (!seen) setActive(true);
  }, []);

  useLayoutEffect(() => {
    if (!active) return;
    const step = STEPS[stepIndex];
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;

    el.scrollIntoView({ block: "center", behavior: "smooth" });

    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    const settleTimer = setTimeout(measure, 260);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("resize", measure);
    };
  }, [active, stepIndex]);

  const finish = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setActive(false);
    setStepIndex(0);
    setRect(null);
  };

  const next = () => {
    if (stepIndex >= STEPS.length - 1) finish();
    else setStepIndex((i) => i + 1);
  };
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));
  const restart = () => {
    setStepIndex(0);
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  const step = STEPS[stepIndex];

  return (
    <>
      <button type="button" className={styles.helpButton} onClick={restart} aria-label="Show walkthrough" title="How does this work?">
        ?
      </button>

      {active && rect && (
        <div className={styles.overlay} role="dialog" aria-label="Walkthrough" aria-modal="true">
          <div
            className={styles.hole}
            style={{
              top: rect.top - MARGIN,
              left: rect.left - MARGIN,
              width: rect.width + MARGIN * 2,
              height: rect.height + MARGIN * 2,
            }}
          />
          <Tooltip
            rect={rect}
            step={step}
            index={stepIndex}
            total={STEPS.length}
            onNext={next}
            onPrev={prev}
            onSkip={finish}
          />
        </div>
      )}
    </>
  );
}

function Tooltip({
  rect,
  step,
  index,
  total,
  onNext,
  onPrev,
  onSkip,
}: {
  rect: DOMRect;
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const width = 300;
  const estimatedHeight = 190;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  let top: number;
  if (spaceBelow > estimatedHeight + 16) {
    top = rect.bottom + 16;
  } else if (spaceAbove > estimatedHeight + 16) {
    top = rect.top - estimatedHeight - 16;
  } else {
    // Target spans (almost) the whole viewport height — neither side fits.
    // Pin inside the viewport rather than let it render off-screen.
    top = 12;
  }
  top = Math.min(Math.max(top, 12), window.innerHeight - estimatedHeight - 12);
  const left = Math.min(Math.max(rect.left, 12), window.innerWidth - width - 12);

  return (
    <div className={styles.tooltip} style={{ top, left, width }}>
      <div className={styles.tooltipTitle}>{step.title}</div>
      <div className={styles.tooltipBody}>{step.body}</div>
      <div className={styles.tooltipFooter}>
        <span className={styles.stepCount}>
          {index + 1} / {total}
        </span>
        <div className={styles.tooltipButtons}>
          <button type="button" className={styles.linkBtn} onClick={onSkip}>
            Skip
          </button>
          {index > 0 && (
            <button type="button" className={styles.secondaryBtn} onClick={onPrev}>
              Back
            </button>
          )}
          <button type="button" className={styles.primaryBtn} onClick={onNext}>
            {index === total - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
