import * as THREE from "three";

/**
 * A single triangle covering clip space, reused by every post-process pass.
 * Cheaper than a quad (no diagonal seam, no extra vertex) and standard practice.
 */
export function createFullscreenTriangleGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

export class FullscreenPass {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly mesh: THREE.Mesh;

  constructor(material: THREE.ShaderMaterial) {
    const geometry = createFullscreenTriangleGeometry();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  get material(): THREE.ShaderMaterial {
    return this.mesh.material as THREE.ShaderMaterial;
  }

  render(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null): void {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }
}
