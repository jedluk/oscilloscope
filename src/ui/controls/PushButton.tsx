import styles from "./PushButton.module.css";

export interface PushButtonGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  renderLabel?: (option: T) => string;
}

export function PushButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: PushButtonGroupProps<T>) {
  return (
    <div className={styles.wrap}>
      <div className={styles.label}>{label}</div>
      <div className={styles.row}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={styles.btn}
            data-active={opt === value}
            onClick={() => onChange(opt)}
          >
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );
}
