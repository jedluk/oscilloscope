import { useEffect, useRef } from "react";
import { OscilloscopeRenderer } from "../gl/OscilloscopeRenderer";
import { downloadCanvasPng } from "../capture/png";
import styles from "./Scope.module.css";

export function Scope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<OscilloscopeRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new OscilloscopeRenderer(canvas);
    rendererRef.current = renderer;

    const container = canvas.parentElement!;
    const resize = () => renderer.setSize(container.clientWidth, container.clientHeight);
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canvasRef.current) downloadCanvasPng(canvasRef.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={styles.screenWell}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
