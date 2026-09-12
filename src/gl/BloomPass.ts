import * as THREE from "three";
import { FullscreenPass } from "./fullscreenQuad";
import { fullscreenVertexShader } from "./shaders/fullscreen";
import { blurFragmentShader } from "./shaders/blur";

const DOWNSCALE = 4;

function makeRT(width: number, height: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

/**
 * Cheap glow: downsample the scene, then two passes of separable gaussian
 * blur, repeated a couple of times for a wider radius. Good enough for
 * phosphor bloom without pulling in the full postprocessing example chain.
 */
export class BloomPass {
  private width: number;
  private height: number;
  private rtLow: THREE.WebGLRenderTarget;
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;

  private readonly copyPass: FullscreenPass;
  private readonly blurPass: FullscreenPass;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const [lw, lh] = this.lowRes();
    this.rtLow = makeRT(lw, lh);
    this.rtA = makeRT(lw, lh);
    this.rtB = makeRT(lw, lh);

    this.copyPass = new FullscreenPass(
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertexShader,
        fragmentShader: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform sampler2D uSource;
          void main() { gl_FragColor = texture2D(uSource, vUv); }
        `,
        uniforms: { uSource: { value: null } },
        depthTest: false,
        depthWrite: false,
      }),
    );

    this.blurPass = new FullscreenPass(
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertexShader,
        fragmentShader: blurFragmentShader,
        uniforms: {
          uSource: { value: null },
          uDirection: { value: new THREE.Vector2(1, 0) },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
  }

  private lowRes(): [number, number] {
    return [Math.max(1, Math.floor(this.width / DOWNSCALE)), Math.max(1, Math.floor(this.height / DOWNSCALE))];
  }

  setSize(width: number, height: number): void {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    const [lw, lh] = this.lowRes();
    this.rtLow.dispose();
    this.rtA.dispose();
    this.rtB.dispose();
    this.rtLow = makeRT(lw, lh);
    this.rtA = makeRT(lw, lh);
    this.rtB = makeRT(lw, lh);
  }

  render(renderer: THREE.WebGLRenderer, sourceTexture: THREE.Texture, radius: number): THREE.Texture {
    const [lw, lh] = this.lowRes();

    this.copyPass.material.uniforms.uSource.value = sourceTexture;
    this.copyPass.render(renderer, this.rtLow);

    let src: THREE.WebGLRenderTarget = this.rtLow;
    const passes = 2;
    const texel = new THREE.Vector2(1 / lw, 1 / lh);

    for (let i = 0; i < passes; i++) {
      const spread = 1 + i * radius * 2;

      this.blurPass.material.uniforms.uSource.value = src.texture;
      (this.blurPass.material.uniforms.uDirection.value as THREE.Vector2).set(texel.x * spread, 0);
      this.blurPass.render(renderer, this.rtA);

      this.blurPass.material.uniforms.uSource.value = this.rtA.texture;
      (this.blurPass.material.uniforms.uDirection.value as THREE.Vector2).set(0, texel.y * spread);
      this.blurPass.render(renderer, this.rtB);

      src = this.rtB;
    }

    return src.texture;
  }

  dispose(): void {
    this.rtLow.dispose();
    this.rtA.dispose();
    this.rtB.dispose();
  }
}
