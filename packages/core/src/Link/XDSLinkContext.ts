/**
 * @file XDSLinkContext.ts
 * @input React createContext, XDSLinkComponentType
 * @output Exports XDSLinkContext and XDSLinkContextValue
 * @position Context definition for polymorphic link support
 *
 * Separated from XDSLinkProvider.tsx to allow components to consume
 * the context without pulling in the full provider implementation.
 * Follows the ThemeContext.ts / XDSTheme.tsx pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/XDSLinkProvider.tsx
 * - /packages/core/src/Link/useXDSLinkComponent.ts
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/README.md
 */

'use client';

import {createContext} from 'react';
import type {XDSLinkComponentType} from './types';

/**
 * Context value for the link provider.
 */
export interface XDSLinkContextValue {
  component: XDSLinkComponentType;
}

/**
 * Context for providing a custom link component to all XDS components.
 * Defaults to null (components fall back to native `<a>`).
 */
export const XDSLinkContext = createContext<XDSLinkContextValue | null>(null);
