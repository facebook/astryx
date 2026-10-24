// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file lazyPopoverBottomSheet.ts
 * @input Uses React lazy and Suspense, useIsHydrating and BottomSheet
 * @output Exports `PopoverBottomSheet`, a BottomSheet that loads on its first
 *   render
 * @position Internal to Popover: the surface of its bottom-sheet presentation
 *
 * A Popover only renders a BottomSheet when its presentation asks for one, so
 * the sheet (and its gestures) loads on demand and stays out of pages whose
 * popovers stay anchored, as DropdownMenu's sheet does
 * (DropdownMenu/lazyMenuBottomSheet.ts). It renders nothing until the module
 * loads, and nothing on the server or in the render that hydrates server HTML
 * (spec:AST-013 FR9); the closed sheet has no visible markup.
 */

import {
  createElement,
  lazy,
  Suspense,
  type ComponentProps,
  type ReactElement,
} from 'react';
import type {BottomSheet as EagerBottomSheet} from '../BottomSheet/BottomSheet';
import {useIsHydrating} from '../hooks/useIsHydrating';

const LazyBottomSheet = lazy(async () =>
  import('../BottomSheet/BottomSheet').then(module => ({
    default: module.BottomSheet,
  })),
);

export function PopoverBottomSheet(
  props: ComponentProps<typeof EagerBottomSheet>,
): ReactElement | null {
  if (useIsHydrating()) {
    return null;
  }
  return createElement(
    Suspense,
    {fallback: null},
    createElement(LazyBottomSheet, props),
  );
}
