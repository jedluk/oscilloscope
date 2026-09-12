export const beamVertexShader = /* glsl */ `
  precision highp float;

  attribute vec2 aCorner; // (0|1 along segment, -1|1 across)
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aIntensity;

  uniform vec2 uResolution;
  uniform float uHalfWidth; // pixels

  varying vec2 vScreenStart;
  varying vec2 vScreenEnd;
  varying vec2 vPos;
  varying float vHalfWidth;
  varying float vIntensity;

  vec4 toClip(vec3 p) {
    return projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }

  void main() {
    vec4 clipStart = toClip(aStart);
    vec4 clipEnd = toClip(aEnd);

    vec2 ndcStart = clipStart.xy / clipStart.w;
    vec2 ndcEnd = clipEnd.xy / clipEnd.w;

    vec2 screenStart = (ndcStart * 0.5 + 0.5) * uResolution;
    vec2 screenEnd = (ndcEnd * 0.5 + 0.5) * uResolution;

    vec2 dir = screenEnd - screenStart;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(1.0, 0.0);
    vec2 normal = vec2(-dir.y, dir.x);

    float extend = uHalfWidth * 1.5;
    float side = aCorner.x < 0.5 ? -1.0 : 1.0;
    vec2 basePos = mix(screenStart, screenEnd, aCorner.x);
    vec2 screenPos = basePos + dir * extend * side + normal * uHalfWidth * aCorner.y;

    vec2 ndcOut = (screenPos / uResolution) * 2.0 - 1.0;
    float w = mix(clipStart.w, clipEnd.w, aCorner.x);
    float z = mix(clipStart.z, clipEnd.z, aCorner.x);

    gl_Position = vec4(ndcOut * w, z, w);

    vScreenStart = screenStart;
    vScreenEnd = screenEnd;
    vPos = screenPos;
    vHalfWidth = uHalfWidth;
    vIntensity = aIntensity;
  }
`;

export const beamFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uGain;

  varying vec2 vScreenStart;
  varying vec2 vScreenEnd;
  varying vec2 vPos;
  varying float vHalfWidth;
  varying float vIntensity;

  void main() {
    vec2 ba = vScreenEnd - vScreenStart;
    vec2 pa = vPos - vScreenStart;
    float baLen2 = max(dot(ba, ba), 1e-6);
    float h = clamp(dot(pa, ba) / baLen2, 0.0, 1.0);
    float dist = length(pa - ba * h);

    float sigma = max(vHalfWidth * 0.5, 0.35);
    float core = exp(-(dist * dist) / (2.0 * sigma * sigma));

    float brightness = core * vIntensity * uGain;
    gl_FragColor = vec4(uColor * brightness, brightness);
  }
`;
