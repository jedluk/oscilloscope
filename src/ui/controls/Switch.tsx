import styles from "./Switch.module.css";

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.switch}
        data-on={checked}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
