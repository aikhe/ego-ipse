import * as THREE from 'three';

export const gemSmokeVertexShader = `precision mediump float;

in vec3 position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) {
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = vec4(position, 1.0);

  vec2 uv = position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  v_responsiveBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

export const gemSmokeFragmentShader = `precision mediump float;

in mediump vec2 v_imageUV;
in mediump vec2 v_objectUV;
in mediump vec2 v_responsiveUV;
in mediump vec2 v_responsiveBoxGivenSize;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colors[6];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform vec4 u_colorInner;

uniform float u_innerDistortion;
uniform float u_outerDistortion;
uniform float u_outerGlow;
uniform float u_innerGlow;
uniform float u_offset;
uniform float u_angle;
uniform float u_size;

uniform float u_shape;
uniform bool u_isImage;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec2 gaussBlur9x9RG(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = max(radius, 0.0) * texel;
  const float k[9] = float[9](1.0, 8.0, 28.0, 56.0, 70.0, 56.0, 28.0, 8.0, 1.0);
  vec2 sum = vec2(0.0);

  for (int j = -4; j <= 4; ++j) {
    float wy = k[j + 4];
    for (int i = -4; i <= 4; ++i) {
      float w = k[i + 4] * wy;
      vec2 off = vec2(float(i) * r.x, float(j) * r.y);
      sum += w * texture(tex, uv + off).rg;
    }
  }

  return sum / 65536.0;
}

float sst(float a, float b, float x) {
  return smoothstep(a, b, x);
}

void main() {
  float time = u_time;

  float roundness = 0.;
  float imgAlpha = 0.;

  if (u_isImage == true) {
    vec2 imageUV = v_imageUV;
    imageUV -= .5;
    imageUV *= .95;
    imageUV += .5;

    vec2 dudx = dFdx(v_imageUV);
    vec2 dudy = dFdy(v_imageUV);

    vec2 blurred = gaussBlur9x9RG(u_image, imageUV, dudx, dudy, 10.);
    roundness = 1. - blurred.x;
    vec2 texelA = 1.0 / vec2(textureSize(u_image, 0));
    const float k3[3] = float[3](1.0, 2.0, 1.0);
    for (int j = -1; j <= 1; ++j) {
      for (int i = -1; i <= 1; ++i) {
        imgAlpha += k3[i + 1] * k3[j + 1] * texture(u_image, imageUV + vec2(float(i) * texelA.x, float(j) * texelA.y)).g;
      }
    }
    imgAlpha /= 16.0;
  } else {
    vec2 uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
    float edge = 0.;

    if (u_shape < 1.) {
      vec2 borderUV = v_responsiveUV + .5;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 2.) {
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * time));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;
    } else if (u_shape < 4.) {
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(time * speed + fi * 1.23) + dir2 * cos(time * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    imgAlpha = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    roundness = 1. - edge;
  }

  vec2 smokeUV = v_objectUV;
  smokeUV = rotate(smokeUV, u_angle * PI / 180.);
  smokeUV *= mix(4., 1., u_size);

  vec2 innerUV = smokeUV;
  vec2 outerUV = smokeUV;

  innerUV.y += u_innerDistortion * (1. - sst(0., 1., length(.4 * innerUV)));
  innerUV.y -= .4 * u_innerDistortion;
  innerUV.y += .7 * u_offset * roundness;

  outerUV.y += u_outerDistortion * (1. - sst(0., 1., length(.4 * outerUV)));
  outerUV.y -= .4 * u_outerDistortion;

  float innerSwirl = u_innerDistortion * roundness;
  float outerSwirl = u_outerDistortion;

  for (int i = 1; i < 5; i++) {
    float fi = float(i);

    float stretchIn = max(length(dFdx(innerUV)), length(dFdy(innerUV)));
    float dampenIn = 1. / (1. + stretchIn * 8.);
    float sIn = innerSwirl * dampenIn;
    innerUV.x += sIn / fi * cos(time + fi * 2.9 * innerUV.y);
    innerUV.y += sIn / fi * cos(time + fi * 1.5 * innerUV.x);

    float stretchOut = max(length(dFdx(outerUV)), length(dFdy(outerUV)));
    float dampenOut = 1. / (1. + stretchOut * 8.);
    float sOut = outerSwirl * dampenOut;
    outerUV.x += sOut / fi * cos(time + fi * 2.9 * outerUV.y);
    outerUV.y += sOut / fi * cos(time + fi * 1.5 * outerUV.x);
  }

  float innerShape = exp(-1.5 * dot(innerUV, innerUV));
  float outerShape = exp(-1.5 * dot(outerUV, outerUV));

  float outerMask = pow(u_outerGlow, 2.) * (1. - imgAlpha);
  float innerMask = (.01 + .99 * u_innerGlow) * imgAlpha;

  innerShape *= innerMask;
  outerShape *= outerMask;

  float mixer = (innerShape + outerShape) * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;

  float smokeMask = 0.;
  for (int i = 1; i < 7; i++) {
    if (i > int(u_colorsCount)) break;

    float m = sst(0., 1., clamp(mixer - float(i - 1), 0., 1.));
    if (i == 1) smokeMask = m;

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * smokeMask;
  float opacity = gradient.a * smokeMask;

  float innerOpacity = u_colorInner.a * imgAlpha;
  vec3 innerColor = u_colorInner.rgb * innerOpacity;
  color += innerColor * (1.0 - opacity);
  opacity += innerOpacity * (1.0 - opacity);

  vec3 backColor = u_colorBack.rgb * u_colorBack.a;
  color += backColor * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);

  fragColor = vec4(color, opacity);
}`;

export type Vec4 = [number, number, number, number];

export interface GemSmokeUniforms {
  u_time: number;
  u_resolution: [number, number];
  u_pixelRatio: number;
  u_imageAspectRatio: number;
  u_image: THREE.Texture | null;
  u_colors: Vec4[];
  u_colorsCount: number;
  u_colorBack: Vec4;
  u_colorInner: Vec4;
  u_innerDistortion: number;
  u_outerDistortion: number;
  u_outerGlow: number;
  u_innerGlow: number;
  u_offset: number;
  u_angle: number;
  u_size: number;
  u_shape: number;
  u_isImage: boolean;
  u_originX: number;
  u_originY: number;
  u_worldWidth: number;
  u_worldHeight: number;
  u_fit: number;
  u_scale: number;
  u_rotation: number;
  u_offsetX: number;
  u_offsetY: number;
}

export const GemSmokeShapes = {
  none: 0,
  circle: 1,
  daisy: 2,
  diamond: 3,
  metaballs: 4,
} as const;

export type GemSmokeShape = keyof typeof GemSmokeShapes;

export function createFullScreenQuadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  return geo;
}

export function getShaderColorFromString(color: string): Vec4 {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b, 1];
}
