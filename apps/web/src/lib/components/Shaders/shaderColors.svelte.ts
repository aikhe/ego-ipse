import { getShaderColorFromString } from '$lib/shaders/gem-smoke/gem-smoke';

const lightColors = ['#454545', '#141414', '#2e2e2e', '#000000'].map(
  getShaderColorFromString
);
const darkColors = ['#9e9e9e', '#c2c2c2', '#e8e8e8', '#ffffff'].map(
  getShaderColorFromString
);
const darkColorInner = getShaderColorFromString('#0a0a0a');
const lightColorInner = getShaderColorFromString('#fafafa');

export function createShaderColors(theme: string) {
  const isDark = theme === 'dark';
  return {
    shaderColors: isDark ? darkColors : lightColors,
    shaderColorInner: isDark ? darkColorInner : lightColorInner,
    baseGlow: isDark ? 0.1 : 0.1,
  };
}
