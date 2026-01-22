/**
 * @file componentStyles.ts
 * @input Uses StyleXStyles from theme/types
 * @output Module augmentation for Layer component styles
 * @position Central type definitions for Layer component theming
 *
 * SYNC: When adding new Layer components, add their style types here.
 */

import type {StyleXStyles} from '../theme/types';

// =============================================================================
// Module Augmentation - Register Layer component styles with ComponentStyles
// =============================================================================
// This allows themes to provide style overrides for Layer components.
// Centralized here to ensure types are available regardless of which
// hooks or components are imported.

declare module '../theme/types' {
  interface ComponentStyles {
    hoverCard?: {
      container?: StyleXStyles;
      content?: StyleXStyles;
      hoverIndication?: StyleXStyles;
    };
    tooltip?: {
      container?: StyleXStyles;
      content?: StyleXStyles;
      hoverIndication?: StyleXStyles;
    };
  }
}
