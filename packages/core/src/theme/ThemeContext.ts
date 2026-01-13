/**
 * Theme Context
 *
 * Separated from Theme.tsx to allow components to consume theme
 * without pulling in the full theme provider implementation.
 */

import { createContext } from 'react';
import type { Theme, ThemeMode } from './types';

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
}

/**
 * Theme context - provides theme to components
 * Components use this to access theme-level variant overrides
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
