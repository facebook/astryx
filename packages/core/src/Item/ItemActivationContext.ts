// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ItemActivationContext.ts
 * @input Uses React createContext
 * @output Exports ItemActivationContext and its ItemActivationSemantics
 * @position Internal seam between Item and the component that renders it
 *
 * Item renders a row's activation, the invisible button that is the row's one
 * tab stop. A component can give that activation the semantics its own
 * presentation implies: List's selection control in edit mode shows a
 * checkbox in each row, so the row's activation is a checkbox whose checked
 * state is the row's selection (`component:List` AR3), and the row's selected
 * state is conveyed by that checked state alone.
 *
 * Publishing it here keeps the wiring internal: the semantics follow from
 * the presentation the component already chose, so a public prop would ask
 * the caller to decide nothing (`spec:AST-002/DEC-1`). Item resets it for
 * what it renders inside, so a nested Item never takes it.
 *
 * `null` when the component gives the activation no semantics of its own.
 */

import {createContext} from 'react';

/** The semantics a row's activation takes: a checkbox, checked or not. */
export interface ItemActivationSemantics {
  role: 'checkbox';
  checked: boolean;
}

export const ItemActivationContext =
  createContext<ItemActivationSemantics | null>(null);
ItemActivationContext.displayName = 'ItemActivationContext';
