// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FormLayoutContext.ts
 * @input Uses React createContext
 * @output Exports FormLayoutContext and FormLayoutDirection type
 * @position Context for form layout direction detection
 *
 * SYNC: When modified, update these files to stay in sync:
 */

import {createContext} from 'react';

/**
 * Direction of form field arrangement.
 *
 * - `'vertical'` — Fields stack top-to-bottom (default). Most common.
 * - `'horizontal'` — Fields arrange left-to-right, wrapping when needed.
 * - `'horizontal-labels'` — Fields stack vertically but labels sit to the left
 *   of their inputs (settings/admin panel pattern).
 */
export type FormLayoutDirection =
  | 'vertical'
  | 'horizontal'
  | 'horizontal-labels';

/**
 * Context for detecting which form layout direction a component is rendered in.
 * Children can use this to adapt their rendering based on the parent layout.
 */
export const FormLayoutContext = createContext<{
  direction: FormLayoutDirection;
}>({direction: 'vertical'});
FormLayoutContext.displayName = 'FormLayoutContext';
