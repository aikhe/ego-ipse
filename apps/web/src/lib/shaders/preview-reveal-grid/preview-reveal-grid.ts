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
uniform float uGridSize;

varying vec2 vUv;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main()
{
    // compute cell counts per axis so each cell is a square pixel region
    float cellsX = round(uContainerRes.x / uGridSize);
    float cellsY = round(uContainerRes.y / uGridSize);
    // clamp to avoid vUv=1.0 producing an out-of-range ghost cell at the edges
    vec2 uv = clamp(vUv, 0.0, 0.9999);
    vec2 grid = vec2(
        floor(uv.x * cellsX) / cellsX,
        floor(uv.y * cellsY) / cellsY
    );

    float height = 0.28;
    float progress = (1.0 + height) - (uProgress * (1.0 + height + height));

    // Symmetric distance-based grid alpha (same as Codrops)
    float d = distance(grid.y, progress);
    float t = clamp(d / height, 0.0, 1.0);

    float rand1 = random(grid);
    float rand2 = random(grid + vec2(1.0, 1.0));

    // Non-linear probability scatter: dense at the center, highly scattered at the edges
    float isBlock = step(t, rand1 * rand1);
    
    // Force cells very close to the center scanline to be solid/opaque (1.0) to hide the cutoff line
    float solidBandWidth = 0.4;
    float densityFactor = smoothstep(solidBandWidth, 0.0, t);
    float targetOpacity = mix((1.0 - t) * (0.3 + 0.7 * rand2), 1.0, densityFactor);
    
    float gridAlpha = isBlock * targetOpacity;
    gridAlpha = clamp(gridAlpha, 0.0, 1.0);

    float revealed = step(progress, grid.y);

    // Above progress line: transparent (reveals native <img>)
    // Below progress line: opaque uBgColor
    vec4 baseColor = mix(vec4(uBgColor, 1.0), vec4(0.0), revealed);

    // Mix the grid color over the base color
    gl_FragColor = mix(baseColor, vec4(uColor, 1.0), gridAlpha);
}
`;
