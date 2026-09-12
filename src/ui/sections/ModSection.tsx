import { useScopeStore } from "../../state/store";
import type { ChannelKey, ModulatableParam } from "../../signal/lfo";
import { waveformIds } from "../../signal/waveforms";
import { Knob } from "../controls/Knob";
import { Switch } from "../controls/Switch";
import styles from "./Sections.module.css";

const CHANNEL_OPTIONS: ChannelKey[] = ["ch1", "ch2", "ch3"];
const PARAM_OPTIONS: ModulatableParam[] = ["freq", "amp", "phaseOffset", "dcOffset"];

export function ModSection() {
  const lfos = useScopeStore((s) => s.lfos);
  const addLfo = useScopeStore((s) => s.addLfo);
  const removeLfo = useScopeStore((s) => s.removeLfo);
  const updateLfo = useScopeStore((s) => s.updateLfo);

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Modulation (LFO)</div>
      {lfos.map((lfo) => (
        <div key={lfo.id} className={styles.lfoCard}>
          <div className={styles.lfoHeader}>
            <Switch label="On" checked={lfo.enabled} onChange={(enabled) => updateLfo(lfo.id, { enabled })} />
            <button className={styles.removeBtn} onClick={() => removeLfo(lfo.id)} type="button">
              remove
            </button>
          </div>
          <div className={styles.lfoSelectRow}>
            <select
              className={styles.select}
              value={lfo.target}
              onChange={(e) => updateLfo(lfo.id, { target: e.target.value as ChannelKey })}
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={lfo.param}
              onChange={(e) => updateLfo(lfo.id, { param: e.target.value as ModulatableParam })}
            >
              {PARAM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={lfo.waveform}
              onChange={(e) => updateLfo(lfo.id, { waveform: e.target.value as (typeof waveformIds)[number] })}
            >
              {waveformIds.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.knobRow}>
            <Knob
              label="Rate"
              value={lfo.rate}
              min={0.01}
              max={10}
              logScale
              defaultValue={0.5}
              unit="Hz"
              onChange={(rate) => updateLfo(lfo.id, { rate })}
            />
            <Knob
              label="Depth"
              value={lfo.depth}
              min={-2}
              max={2}
              step={0.01}
              defaultValue={0}
              formatValue={(v) => v.toFixed(2)}
              onChange={(depth) => updateLfo(lfo.id, { depth })}
            />
          </div>
        </div>
      ))}
      <button className={styles.addBtn} onClick={addLfo} type="button">
        + add LFO
      </button>
    </div>
  );
}
