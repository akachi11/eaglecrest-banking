export const tokens = {
  colors: {
    gold: '#C9A84C',
    goldLight: '#E8C97A',
    goldDim: '#8A6A28',
    bgBase: '#0F0F0F',
    bgCard: '#161616',
    bgElevated: '#1E1E1E',
    bgHover: '#252525',
    textPrimary: '#F0EDE8',
    textSecondary: '#9A9590',
    textMuted: '#5A5652',
    borderDefault: 'rgba(201, 168, 76, 0.14)',
    borderStrong: 'rgba(201, 168, 76, 0.32)',
    success: '#4CAF82',
    danger: '#E05555',
    info: '#5B9BD5',
  },
  fonts: {
    display: "'Playfair Display', serif",
    body: "'DM Sans', sans-serif",
    mono: "'DM Mono', monospace",
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
} as const;

export type ColorToken = keyof typeof tokens.colors;