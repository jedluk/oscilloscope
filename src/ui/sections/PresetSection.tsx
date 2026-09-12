import { useState } from "react";
import { presets, presetToChannels } from "../../state/presets";
import { useScopeStore } from "../../state/store";
import { downloadCanvasPng } from "../../capture/png";
import { downloadBlob, recordCanvasWebm, type Recorder } from "../../capture/webm";
import { LissajousPreview } from "../LissajousPreview";
import styles from "./Sections.module.css";

function getCanvas(): HTMLCanvasElement | null {
  return document.querySelector("canvas");
}

export function PresetSection({ tourId, exportTourId }: { tourId?: string; exportTourId?: string }) {
  const applyPreset = useScopeStore((s) => s.applyPreset);
  const [recorder, setRecorder] = useState<Recorder | null>(null);

  return (
    <>
      <div className={styles.section} data-tour={tourId}>
        <div className={styles.sectionTitle}>Presets</div>
        <div className={styles.presetGrid}>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.presetBtn}
              onClick={() => applyPreset(presetToChannels(p))}
              title={p.label}
            >
              <LissajousPreview ratio={p.ratio} deltaDeg={p.deltaDeg} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section} data-tour={exportTourId}>
        <div className={styles.sectionTitle}>Export</div>
        <div className={styles.exportRow}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => {
              const canvas = getCanvas();
              if (canvas) downloadCanvasPng(canvas);
            }}
          >
            PNG
          </button>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => {
              if (recorder) {
                recorder.stop();
                setRecorder(null);
                return;
              }
              const canvas = getCanvas();
              if (!canvas) return;
              const r = recordCanvasWebm(canvas, (blob) => downloadBlob(blob, "lissajous.webm"));
              setRecorder(r);
            }}
          >
            {recorder ? "Stop REC" : "REC WebM"}
          </button>
        </div>
      </div>
    </>
  );
}
