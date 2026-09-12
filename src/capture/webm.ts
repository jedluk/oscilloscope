export interface Recorder {
  stop: () => void;
}

export function recordCanvasWebm(canvas: HTMLCanvasElement, onDone: (blob: Blob) => void, fps = 60): Recorder {
  const stream = canvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.onstop = () => onDone(new Blob(chunks, { type: mimeType }));

  recorder.start();

  return {
    stop: () => recorder.stop(),
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
