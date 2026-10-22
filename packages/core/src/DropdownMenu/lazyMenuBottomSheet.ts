// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file lazyMenuBottomSheet.ts
 * @input Uses React lazy and Suspense, useIsHydrating, MenuBottomSheet, and
 *   MenuBottomSheetActionList
 * @output Exports MenuBottomSheet and MenuBottomSheetActionList wrappers that
 *   load the touch sheet on first render
 * @position Internal to DropdownMenu
 *
 * The touch sheet (BottomSheet, its gestures, and the touch action list) only
 * renders for the bottom-sheet presentation. Loading it on demand keeps it out
 * of pages whose dropdowns only open as anchored popovers. Each wrapper keeps
 * the wrapped component's props and renders nothing until its module loads.
 *
 * Neither wrapper renders on the server or in the render that hydrates server
 * HTML (spec:AST-013 FR9): a lazy component that has not loaded yet would
 * leave server markup incomplete and abort hydration. The closed sheet has no
 * visible markup, so it first renders right after hydration.
 */

import {
  createElement,
  lazy,
  Suspense,
  type ComponentProps,
  type ReactElement,
} from 'react';
import {useIsHydrating} from '../hooks/useIsHydrating';
import type {MenuBottomSheet as EagerMenuBottomSheet} from './MenuBottomSheet';
import type {MenuBottomSheetActionList as EagerMenuBottomSheetActionList} from './MenuBottomSheetActionList';

const LazyMenuBottomSheet = lazy(async () =>
  import('./MenuBottomSheet').then(module => ({
    default: module.MenuBottomSheet,
  })),
);

const LazyMenuBottomSheetActionList = lazy(async () =>
  import('./MenuBottomSheetActionList').then(module => ({
    default: module.MenuBottomSheetActionList,
  })),
);

export function MenuBottomSheet(
  props: ComponentProps<typeof EagerMenuBottomSheet>,
): ReactElement | null {
  if (useIsHydrating()) {
    return null;
  }
  return createElement(
    Suspense,
    {fallback: null},
    createElement(LazyMenuBottomSheet, props),
  );
}

export function MenuBottomSheetActionList(
  props: ComponentProps<typeof EagerMenuBottomSheetActionList>,
): ReactElement | null {
  if (useIsHydrating()) {
    return null;
  }
  return createElement(
    Suspense,
    {fallback: null},
    createElement(LazyMenuBottomSheetActionList, props),
  );
}
