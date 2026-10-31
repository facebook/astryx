// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TextFocusOwnerContext.ts
 * @input Uses React
 * @output Exports TextFocusOwnerContext
 * @position Text internals; provided by components whose own control takes
 *   focus for their whole surface (ClickableCard), read by Text
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Text/Text.tsx (reads it to skip the truncation tab stop)
 * - /packages/core/src/ClickableCard/ClickableCard.tsx (provides it)
 */

import {createContext} from 'react';

/**
 * True inside a component whose own control already takes keyboard focus for
 * everything it renders, such as a ClickableCard (its hidden link or button
 * covers the card). A truncated Text inside one adds no tab stop of its own,
 * so the card keeps a single stop and a single focus ring. Controls that wrap
 * the Text in the DOM (a link, a button, a menu item) are found from the
 * Text's ancestors instead.
 */
export const TextFocusOwnerContext = createContext(false);
TextFocusOwnerContext.displayName = 'TextFocusOwnerContext';
