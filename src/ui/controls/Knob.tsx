import { useCallback, useRef, useState } from "react";
import styles from "./Knob.module.css";

export interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  logScale?: boolean;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const ANGLE_RANGE = 270; // degrees, -135..+135
// Log-scale knobs (e.g. 0.1-2000Hz freq) need far more travel per octave
// than linear ones, or a couple pixels of mouse jitter swings the value by
// a decade — this was the #1 complaint about knob feel.
const DRAG_PIXELS_LINEAR = 280;
const DRAG_PIXELS_LOG = 600;

function toNorm(value: number, min: number, max: number, log: boolean): number {
  if (log) {
    const lv = Math.log(Math.max(value, 1e-6));
    const lmin = Math.log(Math.max(min, 1e-6));
    const lmax = Math.log(Math.max(max, 1e-6));
    return (lv - lmin) / (lmax - lmin);
  }
  return (value - min) / (max - min);
}

function fromNorm(norm: number, min: number, max: number, log: boolean): number {
  const n = Math.min(1, Math.max(0, norm));
  if (log) {
    const lmin = Math.log(Math.max(min, 1e-6));
    const lmax = Math.log(Math.max(max, 1e-6));
    return Math.exp(lmin + n * (lmax - lmin));
  }
  return min + n * (max - min);
}

export function Knob({
  label,
  value,
  min,
  max,
  step = 0,
  defaultValue,
  unit = "",
  logScale = false,
  onChange,
  formatValue,
}: KnobProps) {
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startY: number; startNorm: number } | null>(null);

  const norm = toNorm(value, min, max, logScale);
  const angle = -ANGLE_RANGE / 2 + norm * ANGLE_RANGE;
  const dragPixelsForFullRange = logScale ? DRAG_PIXELS_LOG : DRAG_PIXELS_LINEAR;

  const commit = useCallback(
    (nextNorm: number) => {
      let next = fromNorm(nextNorm, min, max, logScale);
      if (step > 0) next = Math.round(next / step) * step;
      next = Math.min(max, Math.max(min, next));
      onChange(next);
    },
    [min, max, step, logScale, onChange],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startY: e.clientY, startNorm: norm };
      setDragging(true);
    },
    [norm],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const sensitivity = e.shiftKey ? 4 : 1;
      const dy = dragState.current.startY - e.clientY;
      const deltaNorm = dy / (dragPixelsForFullRange * sensitivity);
      commit(dragState.current.startNorm + deltaNorm);
    },
    [commit, dragPixelsForFullRange],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragState.current = null;
    setDragging(false);
  }, []);

  const onDoubleClick = useCallback(() => {
    if (defaultValue !== undefined) onChange(defaultValue);
  }, [defaultValue, onChange]);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      commit(norm + dir * 0.01 * (e.shiftKey ? 4 : 1));
    },
    [norm, commit],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const big = e.shiftKey ? 4 : 1;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        commit(norm + 0.02 * big);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        commit(norm - 0.02 * big);
      } else if (e.key === "Home") {
        commit(0);
      } else if (e.key === "End") {
        commit(1);
      }
    },
    [norm, commit],
  );

  const display = formatValue ? formatValue(value) : `${value.toFixed(step >= 1 || step === 0 ? 0 : 2)}${unit}`;

  return (
    <div className={styles.knobWrap}>
      <div
        className={`${styles.knob} ${dragging ? styles.dragging : ""}`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        <div className={styles.knobBody}>
          <div className={styles.indicator} style={{ transform: `rotate(${angle}deg)` }} />
        </div>
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{display}</div>
    </div>
  );
}
