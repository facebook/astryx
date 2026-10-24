// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file gestureDelegates.ts
 * @input A component recognizer's published name and the elements that scope
 *   it; delegate methods to apply to it
 * @output Exports PUBLISHED_GESTURES (the names components publish),
 *   gestureNamed (a matcher by name and scope), addGestureDelegate and
 *   useGestureDelegate (delegate methods for recognizers the caller does not
 *   own)
 * @position The way code outside a component relates to the component's own
 *   recognizers, as UIKit apps do through a recognizer's `name` and their own
 *   UIGestureRecognizerDelegate
 *
 * A component publishes a recognizer by giving it a stable `name`,
 * `Component.role` (PUBLISHED_GESTURES lists them). Two instances of a
 * component share the name and are told apart by the element their
 * recognizer is attached to. Outside code then either:
 *
 * - relates its OWN recognizer to them with its existing delegate options:
 *   `shouldRequireFailureOf: (_, other) => sheetDrag(other)` (mine waits for
 *   the sheet's drag), `shouldBeRequiredToFailBy` (the sheet's drag waits for
 *   mine) or `shouldRecognizeSimultaneously`; or
 * - adds delegate methods to THEIRS (`addGestureDelegate`,
 *   `useGestureDelegate`): a veto through `shouldBegin` or
 *   `shouldReceiveTouch`, or a relationship between two component
 *   recognizers. The component's own delegate still runs.
 *
 * Matching happens when a touch asks, never ahead of time, so a component
 * that remounts or an element that appears later is matched with nothing to
 * redo. Code that declares nothing changes nothing.
 *
 * SYNC: When modified, update __tests__/gestureDelegates.test.ts,
 * experimental.ts and README.md.
 */

import {useEffect, useRef} from 'react';
import {getGestureHost} from './GestureHost';
import type {
  GestureDelegate,
  GestureMatcher,
  GestureRecognizer,
} from './GestureRecognizer';

/**
 * The recognizers core components publish, by name. Each is a stable
 * `Component.role`; a component's other recognizers stay private, and a
 * name can be added without breaking anyone.
 * @experimental
 */
export const PUBLISHED_GESTURES = {
  'NavigationStack.backSwipe':
    'The leading screen-edge pan that pops a page (UINavigationController.interactivePopGestureRecognizer).',
  'NavigationStack.contentBackSwipe':
    "iOS 26's back swipe from anywhere in the page's content.",
  'Item.swipe': "The horizontal pan that reveals a row's swipe actions.",
  'Lightbox.dismissPan': 'The drag that closes the viewer.',
  'Lightbox.zoomPan': 'The pan that moves a zoomed photo.',
  'Lightbox.zoomPinch': 'The pinch that zooms a photo.',
  'Carousel.pager': "The paging pan of Carousel and the Lightbox's gallery.",
  'Toast.swipe': 'The swipe that dismisses a toast.',
  'BottomSheet.drag': "The sheet's drag between its detents.",
} as const;

/** @experimental */
export type PublishedGestureName = keyof typeof PUBLISHED_GESTURES;

type ElementSource =
  Element | {readonly current: Element | null} | null | undefined;

/**
 * Which instances a name matches: recognizers attached at or inside
 * `within`, and at or around `containing`. Elements or refs; a ref that
 * holds nothing matches nothing.
 * @experimental
 */
export interface GestureScope {
  within?: ElementSource;
  containing?: ElementSource;
}

function resolve(source: ElementSource): Element | null | undefined {
  if (source == null) {
    return source;
  }
  return source instanceof Element ? source : source.current;
}

/**
 * A matcher for the recognizers with this published name (or one of these
 * names), optionally only the instances in a scope.
 *
 * @example
 * ```
 * // My canvas pan waits for the sheet it sits in to fail.
 * new PanGestureRecognizer({
 *   shouldRequireFailureOf: (_self, other) =>
 *     gestureNamed('BottomSheet.drag', {containing: canvasRef})(other),
 * });
 * ```
 * @experimental
 */
export function gestureNamed(
  name:
    PublishedGestureName | ReadonlyArray<PublishedGestureName> | (string & {}),
  scope: GestureScope = {},
): GestureMatcher {
  const names = new Set<string>(typeof name === 'string' ? [name] : name);
  return (recognizer: GestureRecognizer) => {
    if (!names.has(recognizer.name)) {
      return false;
    }
    const view = recognizer.view;
    if ('within' in scope) {
      const within = resolve(scope.within);
      if (within == null || !(view instanceof Node) || !within.contains(view)) {
        return false;
      }
    }
    if ('containing' in scope) {
      const containing = resolve(scope.containing);
      if (
        containing == null ||
        !(view instanceof Node) ||
        !view.contains(containing)
      ) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Add delegate methods to every recognizer `match` picks in `doc`, on top of
 * their owners' own: any `false` from `shouldBegin` or `shouldReceiveTouch`
 * vetoes, any `true` relationship applies. Returns the function that removes
 * them.
 *
 * @example
 * ```
 * // No back swipe while the form has unsaved changes.
 * const remove = addGestureDelegate(
 *   document,
 *   gestureNamed('NavigationStack.backSwipe', {within: stackElement}),
 *   {shouldBegin: () => !form.isDirty},
 * );
 * ```
 * @experimental
 */
export function addGestureDelegate(
  doc: Document,
  match: GestureMatcher,
  delegate: GestureDelegate,
): () => void {
  return getGestureHost(doc).arena.addDelegate(match, delegate);
}

/** @experimental */
export interface UseGestureDelegateOptions {
  /** Live toggle; off removes the delegate. @default true */
  isEnabled?: boolean;
}

/**
 * `addGestureDelegate` for a component's lifetime, in its document. The
 * matcher and the delegate are read through a ref when a touch asks, so new
 * functions each render re-register nothing and always see current state.
 * @experimental
 */
export function useGestureDelegate(
  match: GestureMatcher,
  delegate: GestureDelegate,
  options: UseGestureDelegateOptions = {},
): void {
  const latestRef = useRef({match, delegate});
  useEffect(() => {
    latestRef.current = {match, delegate};
  });
  const {isEnabled = true} = options;
  useEffect(() => {
    if (!isEnabled || typeof document === 'undefined') {
      return undefined;
    }
    return addGestureDelegate(
      document,
      recognizer => latestRef.current.match(recognizer),
      {
        shouldBegin: recognizer =>
          latestRef.current.delegate.shouldBegin?.(recognizer) ?? true,
        shouldReceiveTouch: (recognizer, touch) =>
          latestRef.current.delegate.shouldReceiveTouch?.(recognizer, touch) ??
          true,
        shouldRecognizeSimultaneously: (recognizer, other) =>
          latestRef.current.delegate.shouldRecognizeSimultaneously?.(
            recognizer,
            other,
          ) ?? false,
        shouldRequireFailureOf: (recognizer, other) =>
          latestRef.current.delegate.shouldRequireFailureOf?.(recognizer, other) ??
          false,
        shouldBeRequiredToFailBy: (recognizer, other) =>
          latestRef.current.delegate.shouldBeRequiredToFailBy?.(
            recognizer,
            other,
          ) ?? false,
      },
    );
  }, [isEnabled]);
}
