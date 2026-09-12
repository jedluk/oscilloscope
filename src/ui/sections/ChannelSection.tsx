import { useScopeStore } from "../../state/store";
import { waveformIds, type WaveformId } from "../../signal/waveforms";
import { Knob } from "../controls/Knob";
import { PushButtonGroup } from "../controls/PushButton";
import styles from "./Sections.module.css";

const WAVEFORM_LABELS: Record<WaveformId, string> = {
  sine: "SIN",
  triangle: "TRI",
  square: "SQR",
  saw: "SAW",
};

export function ChannelSection({
  channelKey,
  title,
  tourId,
}: {
  channelKey: "ch1" | "ch2" | "ch3";
  title: string;
  tourId?: string;
}) {
  const params = useScopeStore((s) => s[channelKey]);
  const setChannel = useScopeStore((s) => s.setChannel);

  return (
    <div className={styles.section} data-tour={tourId}>
      <div className={styles.sectionTitle}>{title}</div>
      <PushButtonGroup
        label="Waveform"
        options={waveformIds}
        value={params.waveform}
        renderLabel={(w) => WAVEFORM_LABELS[w]}
        onChange={(waveform) => setChannel(channelKey, { waveform })}
      />
      <div className={styles.knobRow}>
        <Knob
          label="Freq"
          value={params.freq}
          min={0.1}
          max={2000}
          logScale
          unit="Hz"
          defaultValue={60}
          formatValue={(v) => (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + "Hz"}
          onChange={(freq) => setChannel(channelKey, { freq })}
        />
        <Knob
          label="Amp"
          value={params.amp}
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          formatValue={(v) => v.toFixed(2)}
          onChange={(amp) => setChannel(channelKey, { amp })}
        />
        <Knob
          label="Phase"
          value={params.phaseOffset * 360}
          min={0}
          max={360}
          step={1}
          defaultValue={0}
          unit="°"
          onChange={(deg) => setChannel(channelKey, { phaseOffset: deg / 360 })}
        />
      </div>
      <div className={styles.knobRow}>
        <Knob
          label="DC"
          value={params.dcOffset}
          min={-1}
          max={1}
          step={0.01}
          defaultValue={0}
          formatValue={(v) => v.toFixed(2)}
          onChange={(dcOffset) => setChannel(channelKey, { dcOffset })}
        />
        <Knob
          label="Decay"
          value={params.damping}
          min={0}
          max={3}
          step={0.01}
          defaultValue={0}
          formatValue={(v) => v.toFixed(2)}
          onChange={(damping) => setChannel(channelKey, { damping })}
        />
      </div>
    </div>
  );
}
