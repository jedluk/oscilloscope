// Separable 9-tap gaussian blur, run once horizontal and once vertical.
export const blurFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uSource;
  uniform vec2 uDirection; // texel-space step, e.g. (1/width, 0)

  void main() {
    vec3 sum = texture2D(uSource, vUv).rgb * 0.227027;
    vec2 off1 = uDirection * 1.3846153846;
    vec2 off2 = uDirection * 3.2307692308;

    sum += texture2D(uSource, vUv + off1).rgb * 0.3162162162;
    sum += texture2D(uSource, vUv - off1).rgb * 0.3162162162;
    sum += texture2D(uSource, vUv + off2).rgb * 0.0702702703;
    sum += texture2D(uSource, vUv - off2).rgb * 0.0702702703;

    gl_FragColor = vec4(sum, 1.0);
  }
`;
