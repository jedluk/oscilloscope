export const persistenceFadeFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform float uDecay;

  void main() {
    vec4 prev = texture2D(uPrev, vUv);
    gl_FragColor = vec4(prev.rgb * uDecay, 1.0);
  }
`;
