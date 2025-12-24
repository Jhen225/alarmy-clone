export const theme = {
  colors: {
    background: '#050814',
    surface: '#10152b',
    surfaceAlt: '#171d36',
    primary: '#5ef2b8',
    primarySoft: 'rgba(94, 242, 184, 0.2)',
    danger: '#ff4f6d',
    text: '#f5f7ff',
    textMuted: '#9094b8',
    border: '#242b4a',
    cardGlow: 'rgba(94, 242, 184, 0.3)',
    accentYellow: '#ffe66d',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radii: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
  },
  text: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
    },
  },
};

export type Theme = typeof theme;


