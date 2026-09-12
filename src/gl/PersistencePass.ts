import * as THREE from "three";
import { FullscreenPass } from "./fullscreenQuad";
import { fullscreenVertexShader } from "./shaders/fullscreen";
import { persistenceFadeFragmentShader } from "./shaders/persistence";

function makeRenderTarget(width: number, height: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

/**
 * Ping-pong accumulation buffer that fades the previous frame by a
 * time-based decay factor before the beam is drawn additively on top,
 * simulating phosphor persistence independent of frame rate.
 */
export class PersistencePass {
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private readonly fadePass: FullscreenPass;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.rtA = makeRenderTarget(width, height);
    this.rtB = makeRenderTarget(width, height);

    this.fadePass = new FullscreenPass(
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertexShader,
        fragmentShader: persistenceFadeFragmentShader,
        uniforms: {
          uPrev: { value: null },
          uDecay: { value: 0.9 },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
  }

  setSize(width: number, height: number): void {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.rtA.dispose();
    this.rtB.dispose();
    this.rtA = makeRenderTarget(width, height);
    this.rtB = makeRenderTarget(width, height);
  }

  /** Fades the accumulated buffer into the (now current) target and returns it. */
  fade(renderer: THREE.WebGLRenderer, decay: number): THREE.WebGLRenderTarget {
    this.fadePass.material.uniforms.uPrev.value = this.rtA.texture;
    this.fadePass.material.uniforms.uDecay.value = decay;
    this.fadePass.render(renderer, this.rtB);
    return this.rtB;
  }

  swap(): void {
    const tmp = this.rtA;
    this.rtA = this.rtB;
    this.rtB = tmp;
  }

  get current(): THREE.WebGLRenderTarget {
    return this.rtA;
  }

  dispose(): void {
    this.rtA.dispose();
    this.rtB.dispose();
  }
}
