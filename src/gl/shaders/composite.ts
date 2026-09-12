export const compositeFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uScene;
  uniform sampler2D uBloom;
  uniform float uBloomStrength;
  uniform float uGridBrightness;
  uniform float uCleanMode; // 0 or 1
  uniform vec2 uResolution;
  uniform float uGridDivisions;

  vec3 acesTonemap(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  float gridLine(vec2 uv) {
    vec2 g = abs(fract(uv * uGridDivisions - 0.5) - 0.5) / fwidth(uv * uGridDivisions);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    vec2 centerDist = abs(uv - 0.5);
    float centerLine = 1.0 - min(min(centerDist.x, centerDist.y) / fwidth(uv * uGridDivisions).x * 0.15, 1.0);
    return max(line * 0.5, centerLine * (step(centerDist.x, 0.004) + step(centerDist.y, 0.004)));
  }

  void main() {
    vec3 scene = texture2D(uScene, vUv).rgb;
    vec3 bloom = texture2D(uBloom, vUv).rgb;
    vec3 color = scene + bloom * uBloomStrength;

    // phosphor hot-core: push very bright regions toward white
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    float hot = smoothstep(0.6, 1.6, lum);
    color = mix(color, vec3(1.0), hot * 0.6);

    color = acesTonemap(color * 1.3);

    if (uCleanMode < 0.5) {
      float grid = gridLine(vUv) * uGridBrightness;
      color += vec3(0.15, 0.55, 0.5) * grid * (1.0 - min(lum * 2.0, 1.0));

      vec2 centered = vUv * 2.0 - 1.0;
      float vignette = 1.0 - dot(centered, centered) * 0.35;
      color *= clamp(vignette, 0.0, 1.0);

      float glass = smoothstep(1.0, -0.3, vUv.y + centered.x * 0.3) * 0.03;
      color += vec3(glass);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
