export const vertexShader = `\
varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = `\
uniform vec2 uContainerRes;
uniform float uProgress;
uniform vec3 uColor;
uniform vec3 uBgColor;
uniform float uTime;
uniform vec2 uSeed;

varying vec2 vUv;

// =========================================================================
// CUSTOMIZABLE SMOKE TUNING CONFIGURATION
// =========================================================================
#define SMOKE_SCALE      5.0           // Size of smoke shapes (higher = smaller/detailed, lower = larger/billowy)
#define SMOKE_TURBULENCE 0.4           // Organic swirling intensity (higher = swirly/turbulent, lower = calm waves)
#define SMOKE_WIND_SPEED vec2(0.2, -0.3) // Speed and direction of the smoke drifting (X, Y)
#define SMOKE_JAGGEDNESS 1.2          // How deeply smoke cuts/dissolves into the mask (higher = more irregular)
#define SMOKE_THICKNESS  0.18          // Width of the black smoke band at the transition edge
#define SMOKE_OPACITY    0.9          // Maximum opacity of the dark smoke trail overlay (0.0 to 1.0)
// =========================================================================

// Pseudo-random noise generator
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

// Fractal Brownian Motion (FBM) for swirling smoke detail
float fbm(vec2 p, float time) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    
    for (int i = 0; i < 4; i++) {
        p += sin(p.yx * 1.5 + time * 0.8) * SMOKE_TURBULENCE;
        value += amplitude * noise(p * frequency + (time * SMOKE_WIND_SPEED));
        p = rot * p * 2.0 + shift;
        amplitude *= 0.5;
    }
    return value;
}

void main()
{
    // Generate organic flowing smoke noise field
    vec2 smokeUV = vUv * SMOKE_SCALE + uSeed;
    float smokeNoise = fbm(smokeUV, uTime);

    // Sweep vertical offset from 1.4 (fully unrevealed) to -0.7 (fully revealed)
    // to physically push the entire smoke band off the bottom edge at the end
    float sweep = mix(1.4, -0.7, uProgress);

    // Combine vertical coordinates and smoke density for the reveal map
    float density = vUv.y - sweep + (smokeNoise - 0.5) * SMOKE_JAGGEDNESS;
    density = clamp(density, 0.0, 1.0);

    // The smoke overlay is thickest right at the boundary
    float smokeAlpha = smoothstep(SMOKE_THICKNESS, 0.0, abs(density - 0.15));

    if (density < 0.1) {
        // Below reveal line: Opaque background color
        float edgeBlend = smoothstep(0.0, 0.1, density);
        gl_FragColor = mix(vec4(uBgColor, 1.0), vec4(uColor, 1.0), edgeBlend * 0.8);
    } else {
        // Above reveal line: transparent image area with thick flowing smoke overlay
        gl_FragColor = vec4(uColor, smokeAlpha * SMOKE_OPACITY);
    }
}
`;
