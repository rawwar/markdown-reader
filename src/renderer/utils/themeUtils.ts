/**
 * Lightens a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number = 15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const lighten = (color: number) => Math.min(255, Math.floor(color * (1 + percent / 100)));
  
  return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
}

/**
 * Gets header background color - slightly lighter in dark themes for better visibility
 */
export function getHeaderBackground(themeBackground: string, themeType: 'light' | 'dark'): string {
  if (themeType === 'dark') {
    return lightenColor(themeBackground, 15);
  }
  return themeBackground;
}

