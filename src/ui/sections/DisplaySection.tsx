import { useScopeStore } from "../../state/store";
import { Knob } from "../controls/Knob";
import { Switch } from "../controls/Switch";
import styles from "./Sections.module.css";

export function DisplaySection({ tourId }: { tourId?: string }) {
  const display = useScopeStore((s) => s.display);
  const setDisplay = useScopeStore((s) => s.setDisplay);
  const is3d = useScopeStore((s) => s.is3d);
  const setIs3d = useScopeStore((s) => s.setIs3d);

  return (
    <div className={styles.section} data-tour={tourId}>
      <div className={styles.sectionTitle}>Display</div>
      <div className={styles.knobRow}>
        <Knob
          label="Persist"
          value={display.persistenceTau}
          min={0.02}
          max={2}
          logScale
          defaultValue={0.1}
          formatValue={(v) => `${v.toFixed(2)}s`}
          onChange={(persistenceTau) => setDisplay({ persistenceTau })}
        />
        <Knob
          label="Bright"
          value={display.brightness}
          min={0.1}
          max={4}
          defaultValue={1}
          formatValue={(v) => v.toFixed(2)}
          onChange={(brightness) => setDisplay({ brightness })}
        />
        <Knob
          label="Beam W"
          value={display.beamWidth}
          min={0.5}
          max={6}
          defaultValue={2.2}
          unit="px"
          onChange={(beamWidth) => setDisplay({ beamWidth })}
        />
      </div>
      <div className={styles.knobRow}>
        <Knob
          label="Bloom"
          value={display.bloomStrength}
          min={0}
          max={3}
          defaultValue={0.8}
          formatValue={(v) => v.toFixed(2)}
          onChange={(bloomStrength) => setDisplay({ bloomStrength })}
        />
        <Knob
          label="Glow Rad"
          value={display.bloomRadius}
          min={0}
          max={1.5}
          defaultValue={0.4}
          formatValue={(v) => v.toFixed(2)}
          onChange={(bloomRadius) => setDisplay({ bloomRadius })}
        />
        <Knob
          label="Hue"
          value={display.phosphorHue}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.5}
          formatValue={(v) => v.toFixed(2)}
          onChange={(phosphorHue) => setDisplay({ phosphorHue })}
        />
        <Knob
          label="Grid"
          value={display.gridBrightness}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.35}
          formatValue={(v) => v.toFixed(2)}
          onChange={(gridBrightness) => setDisplay({ gridBrightness })}
        />
      </div>
      <div className={styles.switchRow}>
        <Switch label="Clean" checked={display.cleanMode} onChange={(cleanMode) => setDisplay({ cleanMode })} />
        <Switch label="3D" checked={is3d} onChange={setIs3d} />
      </div>
    </div>
  );
}
