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
    title: "Ekran CRT",
    body: "Wiązka rysuje krzywą Lissajous z sygnału X (CH1) i Y (CH2). Im wolniej porusza się w danym miejscu, tym jaśniej świeci — jak w prawdziwej lampie oscyloskopu.",
  },
  {
    target: "ch1",
    title: "CH1 — kanał X",
    body: "Częstotliwość, kształt fali, faza i amplituda osi poziomej. Gałki: przeciągnij pionowo, scroll, strzałki ↑↓←→, dwuklik = reset, Shift = precyzja.",
  },
  {
    target: "ch2",
    title: "CH2 — kanał Y",
    body: "Stosunek CH1:CH2 decyduje o kształcie (1:1 = elipsa/okrąg, 1:2 = ósemka, 3:4, 5:4...). Faza (δ) między kanałami \"otwiera\" krzywą.",
  },
  {
    target: "display",
    title: "Wygląd ekranu",
    body: "Persist = jak długo świeci ślad wiązki. Bloom/Glow Rad = poświata fosforu. Clean wyłącza siatkę i winietę. 3D dodaje trzeci kanał (Z) i obrót widoku myszką.",
  },
  {
    target: "presets",
    title: "Presety",
    body: "Gotowe klasyczne stosunki Lissajous — kliknij, żeby od razu zobaczyć efekt zamiast kręcić gałkami ręcznie.",
  },
  {
    target: "export",
    title: "Eksport",
    body: "PNG zapisuje bieżącą klatkę, REC WebM nagrywa wideo ekranu. Skrót klawiszowy Cmd/Ctrl+S też zapisuje PNG.",
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
      <button type="button" className={styles.helpButton} onClick={restart} aria-label="Pokaż instrukcję obsługi" title="Jak to działa?">
        ?
      </button>

      {active && rect && (
        <div className={styles.overlay} role="dialog" aria-label="Instrukcja obsługi" aria-modal="true">
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
            Pomiń
          </button>
          {index > 0 && (
            <button type="button" className={styles.secondaryBtn} onClick={onPrev}>
              Wstecz
            </button>
          )}
          <button type="button" className={styles.primaryBtn} onClick={onNext}>
            {index === total - 1 ? "Gotowe" : "Dalej"}
          </button>
        </div>
      </div>
    </div>
  );
}
