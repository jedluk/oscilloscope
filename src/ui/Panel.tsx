import { Scope } from "./Scope";
import { ChannelSection } from "./sections/ChannelSection";
import { DisplaySection } from "./sections/DisplaySection";
import { ModSection } from "./sections/ModSection";
import { PresetSection } from "./sections/PresetSection";
import { OnboardingTour } from "./OnboardingTour";
import { useScopeStore } from "../state/store";
import styles from "./Panel.module.css";

export function Panel() {
  const is3d = useScopeStore((s) => s.is3d);

  return (
    <div className={styles.chassis}>
      <div className={styles.nameplate}>LISSAJOUS · 475A-style CRT scope</div>
      <div className={styles.body}>
        <div className={styles.screenArea} data-tour="screen">
          <Scope />
        </div>
        <div className={styles.controls}>
          <ChannelSection channelKey="ch1" title="CH1 (X)" tourId="ch1" />
          <ChannelSection channelKey="ch2" title="CH2 (Y)" tourId="ch2" />
          {is3d && <ChannelSection channelKey="ch3" title="CH3 (Z)" />}
          <DisplaySection tourId="display" />
          <ModSection />
          <PresetSection tourId="presets" exportTourId="export" />
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}
