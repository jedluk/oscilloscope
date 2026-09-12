import * as THREE from "three";
import { FullscreenPass } from "./fullscreenQuad";
import { fullscreenVertexShader } from "./shaders/fullscreen";
import { compositeFragmentShader } from "./shaders/composite";

export class CompositePass {
  private readonly pass: FullscreenPass;

  constructor() {
    this.pass = new FullscreenPass(
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertexShader,
        fragmentShader: compositeFragmentShader,
        uniforms: {
          uScene: { value: null },
          uBloom: { value: null },
          uBloomStrength: { value: 1.0 },
          uGridBrightness: { value: 0.35 },
          uCleanMode: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uGridDivisions: { value: 10 },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
  }

  render(
    renderer: THREE.WebGLRenderer,
    sceneTexture: THREE.Texture,
    bloomTexture: THREE.Texture,
    opts: { bloomStrength: number; gridBrightness: number; cleanMode: boolean; width: number; height: number },
  ): void {
    const u = this.pass.material.uniforms;
    u.uScene.value = sceneTexture;
    u.uBloom.value = bloomTexture;
    u.uBloomStrength.value = opts.bloomStrength;
    u.uGridBrightness.value = opts.gridBrightness;
    u.uCleanMode.value = opts.cleanMode ? 1 : 0;
    (u.uResolution.value as THREE.Vector2).set(opts.width, opts.height);
    this.pass.render(renderer, null);
  }
}
