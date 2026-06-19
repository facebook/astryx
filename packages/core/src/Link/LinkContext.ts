// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LinkContext.ts
 * @input React createContext, LinkComponentType
 * @output Exports LinkContext and LinkContextValue
 * @position Context definition for polymorphic link support
 *
 * Separated from LinkProvider.tsx to allow components to consume
 * the context without pulling in the full provider implementation.
 * Follows the ThemeContext.ts / Theme.tsx pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/LinkProvider.tsx
 * - /packages/core/src/Link/useLinkComponent.ts
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 */

import {createContext} from 'react';
import type {LinkComponentType} from './types';

/**
 * Context value for the link provider.
 */
export interface LinkContextValue {
  component: LinkComponentType;
}

/**
 * Context for providing a custom link component to all XDS components.
 * Defaults to null (components fall back to native `<a>`).
 */
export const LinkContext = createContext<LinkContextValue | null>(null);
LinkContext.displayName = 'LinkContext';
