import styles from "./Readout.module.css";

export function Readout({ children }: { children: React.ReactNode }) {
  return <div className={styles.readout}>{children}</div>;
}
