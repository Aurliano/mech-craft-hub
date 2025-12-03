/**
 * Main theme export combining all theme elements
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Main theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

// Re-export individual theme parts for convenient named imports
export { colors, typography, spacing, borderRadius, shadows };

export default theme;


