// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ItemLabelContext.tsx
 * @input Uses React createContext
 * @output Exports ItemLabelContext
 * @position Internal seam between Item and a control it renders in a slot
 *
 * Item renders the row's label and owns the element that holds it. A control
 * Item renders in a slot (a List row's reorder handle, which is named
 * "Reorder" followed by the row's label) points at that element with
 * `aria-labelledby`, so a label of any shape names it; only Item knows the
 * element's id. Publishing it here keeps that wiring internal, as
 * ItemDescriptionContext does for the description.
 *
 * `null` when the row renders no label.
 */

import {createContext} from 'react';

export const ItemLabelContext = createContext<string | null>(null);
ItemLabelContext.displayName = 'ItemLabelContext';
