import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BeamSampler, SEGMENT_BUDGET } from "../signal/sampler";
import { BeamPass } from "./BeamPass";
import { PersistencePass } from "./PersistencePass";
import { BloomPass } from "./BloomPass";
import { CompositePass } from "./CompositePass";
import { useScopeStore } from "../state/store";

const VIEW_EXTENT = 1.4;
const MAX_DT = 1 / 15; // clamp huge dt after tab-switch / lag spikes

function phosphorColorFromHue(hue: number): number {
  const color = new THREE.Color();
  color.setHSL(0.45 + hue * 0.15, 0.85, 0.55);
  return color.getHex();
}

export class OscilloscopeRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly orthoCamera: THREE.OrthographicCamera;
  private readonly perspCamera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null;

  private readonly sampler = new BeamSampler();
  private readonly beamPass = new BeamPass();
  private persistencePass: PersistencePass;
  private bloomPass: BloomPass;
  private readonly compositePass = new CompositePass();

  private width = 1;
  private height = 1;
  private lastTime = performance.now();
  private rafId = 0;
  private disposed = false;
  private wasIs3d = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000, 1);

    this.orthoCamera = new THREE.OrthographicCamera(-VIEW_EXTENT, VIEW_EXTENT, VIEW_EXTENT, -VIEW_EXTENT, 0.1, 10);
    this.orthoCamera.position.z = 5;

    this.perspCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    this.perspCamera.position.set(2.2, 1.6, 2.2);
    this.perspCamera.lookAt(0, 0, 0);

    this.persistencePass = new PersistencePass(1, 1);
    this.bloomPass = new BloomPass(1, 1);

    this.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1);
    this.rafId = requestAnimationFrame(this.tick);
  }

  enableOrbitControls(): void {
    if (this.controls) return;
    this.controls = new OrbitControls(this.perspCamera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  disableOrbitControls(): void {
    this.controls?.dispose();
    this.controls = null;
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);

    const pxW = this.width * dpr;
    const pxH = this.height * dpr;
    this.beamPass.setResolution(pxW, pxH);
    this.persistencePass.setSize(pxW, pxH);
    this.bloomPass.setSize(pxW, pxH);

    const aspect = this.width / this.height;
    if (aspect >= 1) {
      this.orthoCamera.left = -VIEW_EXTENT * aspect;
      this.orthoCamera.right = VIEW_EXTENT * aspect;
      this.orthoCamera.top = VIEW_EXTENT;
      this.orthoCamera.bottom = -VIEW_EXTENT;
    } else {
      this.orthoCamera.left = -VIEW_EXTENT;
      this.orthoCamera.right = VIEW_EXTENT;
      this.orthoCamera.top = VIEW_EXTENT / aspect;
      this.orthoCamera.bottom = -VIEW_EXTENT / aspect;
    }
    this.orthoCamera.updateProjectionMatrix();

    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();
  }

  private tick = (): void => {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, MAX_DT);
    this.lastTime = now;

    this.renderFrame(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };

  private renderFrame(dt: number): void {
    const state = useScopeStore.getState();

    if (state.is3d !== this.wasIs3d) {
      this.wasIs3d = state.is3d;
      if (state.is3d) this.enableOrbitControls();
      else this.disableOrbitControls();
    }

    this.controls?.update();

    const camera: THREE.Camera = state.is3d ? this.perspCamera : this.orthoCamera;

    const positions = this.sampler.sampleFrame({
      channels: { ch1: state.ch1, ch2: state.ch2, ch3: state.ch3 },
      lfos: state.lfos,
      is3d: state.is3d,
      dt,
    });

    this.beamPass.setBeamWidth(state.display.beamWidth);
    this.beamPass.setColor(phosphorColorFromHue(state.display.phosphorHue));
    this.beamPass.setGain(state.display.brightness * 6);
    this.beamPass.updateSegments(positions, SEGMENT_BUDGET + 1, dt / SEGMENT_BUDGET);

    const decay = Math.exp(-dt / Math.max(state.display.persistenceTau, 0.01));
    const faded = this.persistencePass.fade(this.renderer, decay);
    this.beamPass.render(this.renderer, camera, faded);
    this.persistencePass.swap();

    const sceneTexture = this.persistencePass.current.texture;
    const bloomTexture = this.bloomPass.render(this.renderer, sceneTexture, state.display.bloomRadius);

    this.compositePass.render(this.renderer, sceneTexture, bloomTexture, {
      bloomStrength: state.display.bloomStrength,
      gridBrightness: state.display.gridBrightness,
      cleanMode: state.display.cleanMode,
      width: this.width,
      height: this.height,
    });
  }

  captureDataURL(): string {
    return this.renderer.domElement.toDataURL("image/png");
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.disableOrbitControls();
    this.persistencePass.dispose();
    this.bloomPass.dispose();
    this.renderer.dispose();
  }
}
