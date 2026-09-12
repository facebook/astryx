// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollableArea.ts
 * @input Logical scroll intent, keyboard ownership, caller-owned viewport/content props
 * @output Safe prop getters, logical-to-physical axis mapping, and stable per-axis effective scroll state
 * @position Canonical behavior core for ScrollableArea and structure-owning adopters
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/useScrollableArea.doc.mjs
 * - /packages/core/src/hooks/useScrollableArea.test.tsx
 * - /packages/core/src/hooks/index.ts
 */

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
  type RefAttributes,
  type RefCallback,
} from 'react';
import type {BaseProps} from '../BaseProps';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';
import {mergeRefs} from '../utils/mergeRefs';
import {observeResize} from '../utils/sharedResizeObserver';
import {
  getLogicalAxisMapping,
  measureLogicalScrollAxis,
  type LogicalAxisMapping,
} from './scrollGeometry';
import {
  registerScrollOwner,
  unregisterScrollOwner,
} from './scrollOwnerRegistry';

export type ScrollAxis = 'inline' | 'block' | 'both';
export type ScrollOverscroll = 'allow' | 'contain';

export type ScrollKeyboardAccess =
  | {owner: 'content'}
  | {owner: 'viewport'; label: string; role?: 'group' | 'region'};

export interface ScrollAxisState {
  isScrollable: boolean;
  atStart: boolean;
  atEnd: boolean;
}

export interface ScrollableAreaState {
  inline: ScrollAxisState;
  block: ScrollAxisState;
}

export interface UseScrollableAreaOptions {
  axis: ScrollAxis;
  keyboardAccess: ScrollKeyboardAccess;
  overscroll?: ScrollOverscroll;
}

export type ScrollableElementProps<E extends HTMLElement> = BaseProps<E> &
  RefAttributes<E>;

export interface UseScrollableAreaResult {
  getViewportProps<E extends HTMLElement>(
    props?: ScrollableElementProps<E>,
  ): ScrollableElementProps<E>;
  getContentProps<E extends HTMLElement>(
    props?: ScrollableElementProps<E>,
  ): ScrollableElementProps<E>;
  state: ScrollableAreaState;
  /** Current logical-to-physical mapping derived from writing mode and direction. */
  axisMapping: LogicalAxisMapping;
}

const INACTIVE_AXIS_STATE: ScrollAxisState = {
  isScrollable: false,
  atStart: true,
  atEnd: true,
};
const INITIAL_STATE: ScrollableAreaState = {
  inline: INACTIVE_AXIS_STATE,
  block: INACTIVE_AXIS_STATE,
};
const INITIAL_MAPPING: LogicalAxisMapping = {
  inline: 'x',
  block: 'y',
  inlineReversed: false,
  blockReversed: false,
};

function axisIsRequested(requested: ScrollAxis, axis: 'inline' | 'block') {
  return requested === axis || requested === 'both';
}

function statesEqual(a: ScrollableAreaState, b: ScrollableAreaState): boolean {
  return (
    a.inline.isScrollable === b.inline.isScrollable &&
    a.inline.atStart === b.inline.atStart &&
    a.inline.atEnd === b.inline.atEnd &&
    a.block.isScrollable === b.block.isScrollable &&
    a.block.atStart === b.block.atStart &&
    a.block.atEnd === b.block.atEnd
  );
}

function mappingsEqual(a: LogicalAxisMapping, b: LogicalAxisMapping): boolean {
  return (
    a.inline === b.inline &&
    a.block === b.block &&
    a.inlineReversed === b.inlineReversed &&
    a.blockReversed === b.blockReversed
  );
}

function useStableComposedRef(
  internalRef: RefCallback<HTMLElement>,
): (externalRef: Ref<HTMLElement> | undefined) => RefCallback<HTMLElement> {
  const cachedExternalRef = useRef<Ref<HTMLElement> | undefined>(undefined);
  const cachedComposedRef = useRef<RefCallback<HTMLElement> | null>(null);
  return useCallback(
    (externalRef: Ref<HTMLElement> | undefined) => {
      if (
        cachedComposedRef.current != null &&
        Object.is(cachedExternalRef.current, externalRef)
      ) {
        return cachedComposedRef.current;
      }
      const composed = mergeRefs(externalRef, internalRef);
      cachedExternalRef.current = externalRef;
      cachedComposedRef.current = composed;
      return composed;
    },
    [internalRef],
  );
}

/**
 * Adds axis-aware scroll behavior to caller-owned viewport and content boxes.
 * The returned prop getters compose refs and preserve caller props, so spread
 * order cannot detach measurement or override behavior-owned accessibility.
 */
export function useScrollableArea({
  axis,
  keyboardAccess,
  overscroll = 'allow',
}: UseScrollableAreaOptions): UseScrollableAreaResult {
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [measured, setMeasured] = useState<ScrollableAreaState>(INITIAL_STATE);
  const [mapping, setMapping] = useState<LogicalAxisMapping>(INITIAL_MAPPING);
  const stateRef = useRef<ScrollableAreaState>(INITIAL_STATE);

  const viewportRef = useCallback((node: HTMLElement | null) => {
    setViewport(current => (current === node ? current : node));
  }, []);
  const contentRef = useCallback((node: HTMLElement | null) => {
    setContent(current => (current === node ? current : node));
  }, []);
  const getComposedViewportRef = useStableComposedRef(viewportRef);
  const getComposedContentRef = useStableComposedRef(contentRef);

  useIsomorphicLayoutEffect(() => {
    if (viewport == null || content == null) {
      return;
    }

    let frame: number | null = null;
    let isActive = true;

    const measure = () => {
      frame = null;
      const computedStyle = getComputedStyle(viewport);
      const nextMapping = getLogicalAxisMapping(
        computedStyle.writingMode,
        computedStyle.direction,
      );
      const inline = axisIsRequested(axis, 'inline')
        ? measureLogicalScrollAxis(viewport, 'inline', nextMapping)
        : INACTIVE_AXIS_STATE;
      const block = axisIsRequested(axis, 'block')
        ? measureLogicalScrollAxis(viewport, 'block', nextMapping)
        : INACTIVE_AXIS_STATE;

      // Hidden, disconnected, and zero-size viewports are unknown rather than
      // fitting. Keep the last valid state until a bounded signal remeasures.
      if (inline == null || block == null) {
        return;
      }

      const nextState = {inline, block};
      stateRef.current = nextState;
      registerScrollOwner(viewport, nextState);
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- measured DOM state is the hook's output
      setMeasured(current =>
        statesEqual(current, nextState) ? current : nextState,
      );
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- writing-mode changes remap behavior-owned physical CSS
      setMapping(current =>
        mappingsEqual(current, nextMapping) ? current : nextMapping,
      );
    };

    const scheduleMeasure = () => {
      if (!isActive || frame != null) {
        return;
      }
      frame = window.requestAnimationFrame(measure);
    };

    registerScrollOwner(viewport, stateRef.current);
    measure();
    const stopObservingViewport = observeResize(viewport, scheduleMeasure);
    const stopObservingContent = observeResize(content, scheduleMeasure);

    viewport.addEventListener('scroll', scheduleMeasure, {passive: true});
    window.addEventListener('resize', scheduleMeasure);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);
    content.addEventListener('load', scheduleMeasure, true);
    viewport.addEventListener('transitionend', scheduleMeasure);
    viewport.addEventListener('animationend', scheduleMeasure);
    content.addEventListener('transitionend', scheduleMeasure);
    content.addEventListener('animationend', scheduleMeasure);

    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(scheduleMeasure);
    mutationObserver?.observe(viewport, {
      attributes: true,
      attributeFilter: ['class', 'dir', 'hidden', 'style'],
    });
    mutationObserver?.observe(content, {
      attributes: true,
      attributeFilter: ['class', 'dir', 'hidden', 'style'],
      characterData: true,
      childList: true,
      subtree: true,
    });
    let ancestor = viewport.parentElement;
    while (ancestor != null) {
      mutationObserver?.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'dir', 'hidden', 'style'],
      });
      ancestor = ancestor.parentElement;
    }

    const fonts = document.fonts;
    fonts?.addEventListener?.('loadingdone', scheduleMeasure);
    void fonts?.ready.then(scheduleMeasure);

    return () => {
      isActive = false;
      unregisterScrollOwner(viewport);
      stopObservingViewport();
      stopObservingContent();
      mutationObserver?.disconnect();
      viewport.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      content.removeEventListener('load', scheduleMeasure, true);
      viewport.removeEventListener('transitionend', scheduleMeasure);
      viewport.removeEventListener('animationend', scheduleMeasure);
      content.removeEventListener('transitionend', scheduleMeasure);
      content.removeEventListener('animationend', scheduleMeasure);
      fonts?.removeEventListener?.('loadingdone', scheduleMeasure);
      if (frame != null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [axis, content, viewport]);

  const state = useMemo<ScrollableAreaState>(
    () => ({
      inline: axisIsRequested(axis, 'inline')
        ? measured.inline
        : INACTIVE_AXIS_STATE,
      block: axisIsRequested(axis, 'block')
        ? measured.block
        : INACTIVE_AXIS_STATE,
    }),
    [axis, measured],
  );

  const getViewportProps = useCallback(
    <E extends HTMLElement>(
      props: ScrollableElementProps<E> = {},
    ): ScrollableElementProps<E> => {
      const hasEffectiveAxis =
        state.inline.isScrollable || state.block.isScrollable;
      const keepsProgrammaticFocus =
        !hasEffectiveAxis &&
        viewport != null &&
        typeof document !== 'undefined' &&
        document.activeElement === viewport;
      const behaviorStyle: CSSProperties = {...props.style};
      const containInline =
        overscroll === 'contain' && state.inline.isScrollable;
      const containBlock = overscroll === 'contain' && state.block.isScrollable;
      const inlinePhysical = mapping.inline;
      const blockPhysical = mapping.block;

      if (axisIsRequested(axis, 'inline')) {
        behaviorStyle[
          inlinePhysical === 'x' ? 'overscrollBehaviorX' : 'overscrollBehaviorY'
        ] = containInline ? 'contain' : 'auto';
      }
      if (axisIsRequested(axis, 'block')) {
        behaviorStyle[
          blockPhysical === 'x' ? 'overscrollBehaviorX' : 'overscrollBehaviorY'
        ] = containBlock ? 'contain' : 'auto';
      }

      const keyboardProps =
        keyboardAccess.owner === 'viewport'
          ? {
              role: keyboardAccess.role ?? 'group',
              'aria-label': keyboardAccess.label,
              tabIndex: hasEffectiveAxis
                ? 0
                : keepsProgrammaticFocus
                  ? -1
                  : undefined,
            }
          : {};

      const result: ScrollableElementProps<E> = {
        ...props,
        ...keyboardProps,
        ref: getComposedViewportRef(props.ref),
        style: behaviorStyle,
        'data-scroll-axis': axis,
        'data-scrollable-inline': state.inline.isScrollable
          ? 'true'
          : undefined,
        'data-scrollable-block': state.block.isScrollable ? 'true' : undefined,
        'data-scroll-inline-start': state.inline.atStart ? 'true' : undefined,
        'data-scroll-inline-end': state.inline.atEnd ? 'true' : undefined,
        'data-scroll-block-start': state.block.atStart ? 'true' : undefined,
        'data-scroll-block-end': state.block.atEnd ? 'true' : undefined,
      };
      return result;
    },
    [
      axis,
      getComposedViewportRef,
      keyboardAccess,
      mapping,
      overscroll,
      state,
      viewport,
    ],
  );

  const getContentProps = useCallback(
    <E extends HTMLElement>(
      props: ScrollableElementProps<E> = {},
    ): ScrollableElementProps<E> => {
      const result: ScrollableElementProps<E> = {
        ...props,
        ref: getComposedContentRef(props.ref),
        'data-scroll-content': '',
      };
      return result;
    },
    [getComposedContentRef],
  );

  return {getViewportProps, getContentProps, state, axisMapping: mapping};
}
