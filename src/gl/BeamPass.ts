import * as THREE from "three";
import { beamFragmentShader, beamVertexShader } from "./shaders/beam";
import { SEGMENT_BUDGET } from "../signal/sampler";

const MIN_SEGMENT_LENGTH = 0.0002;

export class BeamPass {
  readonly scene = new THREE.Scene();
  private readonly geometry: THREE.InstancedBufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly mesh: THREE.Mesh;

  private readonly aStart: Float32Array;
  private readonly aEnd: Float32Array;
  private readonly aIntensity: Float32Array;
  private readonly startAttr: THREE.InstancedBufferAttribute;
  private readonly endAttr: THREE.InstancedBufferAttribute;
  private readonly intensityAttr: THREE.InstancedBufferAttribute;

  constructor() {
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.setIndex([0, 1, 2, 0, 2, 3]);

    const corner = new Float32Array([0, -1, 1, -1, 1, 1, 0, 1]);
    this.geometry.setAttribute("aCorner", new THREE.BufferAttribute(corner, 2));

    this.aStart = new Float32Array(SEGMENT_BUDGET * 3);
    this.aEnd = new Float32Array(SEGMENT_BUDGET * 3);
    this.aIntensity = new Float32Array(SEGMENT_BUDGET);

    this.startAttr = new THREE.InstancedBufferAttribute(this.aStart, 3);
    this.endAttr = new THREE.InstancedBufferAttribute(this.aEnd, 3);
    this.intensityAttr = new THREE.InstancedBufferAttribute(this.aIntensity, 1);
    this.startAttr.setUsage(THREE.DynamicDrawUsage);
    this.endAttr.setUsage(THREE.DynamicDrawUsage);
    this.intensityAttr.setUsage(THREE.DynamicDrawUsage);

    this.geometry.setAttribute("aStart", this.startAttr);
    this.geometry.setAttribute("aEnd", this.endAttr);
    this.geometry.setAttribute("aIntensity", this.intensityAttr);
    this.geometry.instanceCount = SEGMENT_BUDGET;

    this.material = new THREE.ShaderMaterial({
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uHalfWidth: { value: 1.5 },
        uColor: { value: new THREE.Color(0x66ffe0) },
        uGain: { value: 1.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setResolution(width: number, height: number): void {
    (this.material.uniforms.uResolution.value as THREE.Vector2).set(width, height);
  }

  setBeamWidth(px: number): void {
    this.material.uniforms.uHalfWidth.value = px * 0.5;
  }

  setColor(hex: number): void {
    (this.material.uniforms.uColor.value as THREE.Color).setHex(hex);
  }

  setGain(gain: number): void {
    this.material.uniforms.uGain.value = gain;
  }

  /**
   * positions: (N+1) xyz points describing the polyline traced this frame.
   * segmentDuration: wall-clock seconds the beam spent drawing each segment
   * (dt / segCount) — brightness is dwell-time / length, so it stays
   * physically consistent regardless of the fixed segment budget.
   */
  updateSegments(positions: Float32Array, pointCount: number, segmentDuration: number): void {
    const segCount = Math.min(pointCount - 1, SEGMENT_BUDGET);

    for (let i = 0; i < segCount; i++) {
      const a = i * 3;
      const b = (i + 1) * 3;
      this.aStart[a] = positions[a];
      this.aStart[a + 1] = positions[a + 1];
      this.aStart[a + 2] = positions[a + 2];
      this.aEnd[a] = positions[b];
      this.aEnd[a + 1] = positions[b + 1];
      this.aEnd[a + 2] = positions[b + 2];

      const dx = positions[b] - positions[a];
      const dy = positions[b + 1] - positions[a + 1];
      const dz = positions[b + 2] - positions[a + 2];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const dwellDensity = segmentDuration / Math.max(len, MIN_SEGMENT_LENGTH);
      // sqrt-compress: real beam dwell time varies over orders of magnitude
      // between fast straightaways and slow cusps (e.g. a 1:2 figure-8).
      // Left linear, cusps blow out to white while straightaways vanish
      // below the display's visible range. Compressing keeps cusps brighter
      // than straightaways (still reads as "beam slowed down here") without
      // losing either end.
      this.aIntensity[i] = Math.sqrt(dwellDensity);
    }

    this.geometry.instanceCount = segCount;
    this.startAttr.needsUpdate = true;
    this.endAttr.needsUpdate = true;
    this.intensityAttr.needsUpdate = true;
  }

  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, target: THREE.WebGLRenderTarget | null): void {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, camera);
  }
}
