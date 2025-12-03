/**
 * Color palette matching the website design system
 * Based on HSL colors from website Tailwind config
 */

export const colors = {
  // Primary colors (Blue)
  primary: '#1e3a5f', // hsl(215, 85%, 25%)
  primaryLight: '#4a6fa5', // hsl(215, 85%, 45%)
  primaryGlow: '#7a9fd4', // hsl(215, 85%, 65%)
  primaryForeground: '#fafafa', // hsl(0, 0%, 98%)

  // Secondary colors
  secondary: '#d4d9e0', // hsl(215, 15%, 85%)
  secondaryForeground: '#263238', // hsl(215, 25%, 15%)

  // Accent colors (Yellow/Gold)
  accent: '#f5c842', // hsl(45, 93%, 47%)
  accentLight: '#f8d66f', // hsl(45, 93%, 67%)
  accentForeground: '#fafafa', // hsl(0, 0%, 98%)

  // Background colors
  background: '#fafafa', // hsl(0, 0%, 98%)
  foreground: '#263238', // hsl(215, 25%, 15%)

  // Card colors
  card: '#ffffff',
  cardForeground: '#263238',

  // Muted colors
  muted: '#ebedf0', // hsl(215, 15%, 92%)
  mutedForeground: '#7a8490', // hsl(215, 10%, 50%)

  // Destructive colors (Red)
  destructive: '#ef4444', // hsl(0, 84.2%, 60.2%)
  destructiveForeground: '#fafafa',

  // Border and input
  border: '#e0e4e8', // hsl(215, 15%, 88%)
  input: '#e0e4e8',
  ring: '#1e3a5f', // primary

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Text colors
  text: {
    primary: '#263238',
    secondary: '#7a8490',
    disabled: '#b0b8c0',
    inverse: '#fafafa',
  },

  // Surface colors
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
} as const;

export type ColorName = keyof typeof colors;

