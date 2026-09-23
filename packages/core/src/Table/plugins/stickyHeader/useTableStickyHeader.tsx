// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableStickyHeader.tsx
 * @input React, StyleX, theme tokens, Table types, useScrollableArea, shared resize observer
 * @output Exports useTableStickyHeader and its config; owns published header extent cleanup
 * @position Sticky-header plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (sticky-header documentation)
 * - /packages/core/src/Table/index.ts (exports)
 * - /packages/core/src/Table/plugins/stickyTiers.stylex.ts (paint order)
 */

import {useCallback, useMemo, useRef, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../../../theme/tokens.stylex';
import {useScrollableArea} from '../../../hooks/useScrollableArea';
import {observeResize} from '../../../utils/sharedResizeObserver';
import {STICKY_TIER} from '../stickyTiers.stylex';
import type {
  TablePlugin,
  HeaderCellRenderProps,
  ScrollWrapperRenderProps,
} from '../../types';

/**
 * The pinned header's block extent, published on the scroll container.
 *
 * Anything else pinning inside the same scrollport has to start below the
 * header or it will be drawn over it, and the extent is not knowable ahead of
 * time — it moves with density, with wrapped headings, and with whatever a
 * column puts in its `header`. Publishing it as a variable is what lets
 * `useTableGroupedRows` clear the header without the two plugins referring to
 * each other, the same way they already share `--table-sticky-background`.
 */
const HEADER_EXTENT_VAR = '--table-sticky-header-height';

// =============================================================================
// Config
// =============================================================================

/**
 * Config for {@link useTableStickyHeader}.
 *
 * @remarks Every field is optional, so `useTableStickyHeader({})` compiles. It
 * is not a no-op: pinning the header is the whole point of installing the
 * plugin, and the size is what the caller may or may not need to state.
 */
export interface UseTableStickyHeaderConfig {
  /**
   * Cap on the scroll container's size along the block axis — the axis the
   * header pins on — as `480` or any CSS length such as `'60vh'`.
   *
   * Logical rather than a height: in a vertical writing mode the block axis
   * runs horizontally, and the cap has to follow the axis the header actually
   * travels on.
   *
   * The header pins to the scrollport the table itself owns, so the table needs
   * one. Without a cap the scroll container grows to fit its rows and never
   * scrolls, which leaves the surrounding page to scroll instead — and a header
   * cannot pin to a scrollport it is not inside.
   *
   * Omit this only when an ancestor already bounds the table (a `Layout` pane,
   * a flex child with `min-block-size: 0`), in which case the container is
   * already a scrollport and capping it again would fight that.
   */
  maxBlockSize?: number | string;

  /**
   * Keep the header pinned even while the table fits its container.
   *
   * `spec:AST-025` DEC-3: scroll intent alone does not make a container a
   * Sticky boundary. By default a table with nothing to scroll leaves the
   * boundary to whatever owns it outside, so a header pinned by an ancestor
   * scrollport still works. Set this when the table should stay a Sticky
   * boundary regardless — the same explicit opt-in `ScrollableArea` exposes.
   *
   * @default false
   */
  hasPersistentContainment?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const stickyHeaderStyles = stylex.create({
  headerCell: {
    // Header cells are transparent by default, so rows would show through the
    // pinned row as they pass under it. Shares `--table-sticky-background` with
    // useTableStickyColumns so a table using both keeps one opaque surface
    // across the header and the pinned column, including the corner where they
    // meet, and one override changes all of it.
    backgroundColor: `var(--table-sticky-background, ${colorVars['--color-background-card']})`,
    // padding-box keeps the base off the cell's collapsed divider border.
    backgroundClip: 'padding-box',
  },
});

// =============================================================================
// Hook
// =============================================================================

// Keyboard ownership stays with the content: Table's scroll wrapper already
// carries its own labelled tab stop, and whether that stop should follow
// effective overflow is Table's call to make for every table, not something
// this plugin should change for the tables that happen to install it.
//
// Hoisted so its identity is stable: the hook keys its prop getters on this
// object, and a fresh literal each render would rebuild the plugin — and with
// it Table's whole transform pipeline — on every parent render.
const CONTENT_KEYBOARD_ACCESS = {owner: 'content'} as const;

/**
 * Pins the header row to the top of the table's scroll container, so column
 * headings stay readable while the body scrolls.
 *
 * The header is pinned only while the scroll container is *measurably* the
 * block-axis scroll owner, per `spec:AST-025` FR10 and FR21. A table that fits
 * does not quietly become a Sticky boundary and steal a header pinned by an
 * outer scrollport; use `hasPersistentContainment` to keep the boundary anyway.
 *
 * Composes with `useTableStickyColumns`: install both to pin a column and the
 * header at once. Paint order comes from the shared tier table in
 * `plugins/stickyTiers.stylex.ts`, so the corner cell — pinned on both axes — stays
 * above both runs regardless of the order the plugins are listed in.
 *
 * @example
 * ```
 * const stickyHeader = useTableStickyHeader({maxBlockSize: 480});
 *
 * <Table data={rows} columns={columns} plugins={{stickyHeader}} />
 * ```
 */
export function useTableStickyHeader<T extends Record<string, unknown>>(
  config: UseTableStickyHeaderConfig = {},
): TablePlugin<T> {
  const {maxBlockSize, hasPersistentContainment = false} = config;

  // The shared scroll behavior owns axis resolution, live measurement, and the
  // overflow the wrapper ends up declaring. `spec:AST-025` IR1: plugins adopt
  // this rather than running a second overflow detector beside it.
  const {getViewportProps, getContentProps, state} = useScrollableArea({
    axis: 'both',
    keyboardAccess: CONTENT_KEYBOARD_ACCESS,
    stickyContainment: hasPersistentContainment ? 'always' : 'whenScrollable',
  });

  // The hook measures the viewport against a real content box. Table already
  // owns one — the `<table>` element — so register it directly instead of
  // wrapping the caller's rows in a box the hook invented (`spec:AST-025` FR6).
  const contentRef = getContentProps<HTMLTableElement>().ref;
  const registerContent = useCallback(
    (node: HTMLTableElement | null) => {
      if (typeof contentRef === 'function') {
        contentRef(node);
      } else if (contentRef != null) {
        contentRef.current = node;
      }
    },
    [contentRef],
  );

  // Header extent is a different measurement from overflow geometry, and the
  // shared hook does not publish it. It stays here, but on the shared observer
  // so it costs one entry rather than a second ResizeObserver per table, and it
  // never goes through React: the value is only ever read back out as a CSS
  // variable, so rendering it would repaint the whole table to no effect.
  const detachRef = useRef<(() => void) | null>(null);
  const publishHeaderExtent = useCallback((el: HTMLDivElement | null) => {
    detachRef.current?.();
    detachRef.current = null;
    if (el == null) {
      return;
    }
    // Refs attach depth-first, so the table is already in the DOM here.
    const head = el.querySelector('thead');
    if (head == null) {
      return;
    }
    const update = () => {
      const rect = head.getBoundingClientRect();
      // AST-025 FR1/FR3: resolve the logical block axis through the computed
      // writing mode before reading physical geometry. In vertical and
      // sideways writing modes the block axis is horizontal, so the header's
      // block extent is its width; publishing the physical height would clip
      // the pinned heading and the collapse control.
      const blockIsHorizontal = /^(vertical|sideways)/.test(
        getComputedStyle(head).writingMode,
      );
      el.style.setProperty(
        HEADER_EXTENT_VAR,
        `${blockIsHorizontal ? rect.width : rect.height}px`,
      );
    };
    const stopObserving = observeResize(head, update);
    update();
    detachRef.current = () => {
      stopObserving();
      el.style.removeProperty(HEADER_EXTENT_VAR);
    };
  }, []);

  // `spec:AST-025` FR10: a block-start Sticky participant resolves against the
  // nearest *effective* block owner. Until the wrapper measurably overflows on
  // that axis it is not one, and pinning here would bind the header to a
  // boundary that cannot move. Explicit containment keeps the boundary, so it
  // keeps the pin with it.
  const isPinned = state.block.isScrollable || hasPersistentContainment;

  return useMemo<TablePlugin<T>>(
    () => ({
      transformScrollWrapper(
        props: ScrollWrapperRenderProps,
      ): ScrollWrapperRenderProps {
        // A runtime value, so inline style rather than a static StyleX rule.
        // Logical, so it caps the axis the header pins on in every writing mode.
        const sizeStyle: CSSProperties =
          maxBlockSize == null
            ? {}
            : {
                maxBlockSize:
                  typeof maxBlockSize === 'number'
                    ? `${maxBlockSize}px`
                    : maxBlockSize,
              };

        // Compose with any ref a prior plugin set on the same element, the
        // way useTableStickyColumns does for its scroll shadows.
        const existingRef = props.htmlProps.ref;
        const mergedRef = (node: HTMLDivElement | null) => {
          publishHeaderExtent(node);
          registerContent(node?.querySelector('table') ?? null);
          if (typeof existingRef === 'function') {
            existingRef(node);
          } else if (existingRef != null) {
            existingRef.current = node;
          }
        };

        // The getter consumes the wrapper's already-resolved props and returns
        // one safe spread: behaviour-owned overflow (clip while fitting, the
        // writing-mode-resolved auto/hidden pair once it overflows), per-axis
        // overscroll, viewport registration, and the scroll-state data
        // attributes. `hasPluginOwnedOverflow` tells Table to stop declaring its own
        // `overflow-x` on the same element so there is exactly one owner.
        const {
          xstyle: _consumed,
          ref,
          ...viewportProps
        } = getViewportProps<HTMLDivElement>({
          ...props.htmlProps,
          ref: mergedRef,
          style: {...props.htmlProps.style, ...sizeStyle},
          xstyle: props.xstyle,
        });

        return {
          ...props,
          htmlProps: {...viewportProps, ref},
          // Consumed above: the getter folded the wrapper's xstyle into the
          // className it returned, alongside the overflow it owns. Passing it
          // again would put two overflow declarations back on the element.
          xstyle: [],
          hasPluginOwnedOverflow: true,
        };
      },

      transformHeaderCell(props: HeaderCellRenderProps): HeaderCellRenderProps {
        if (!isPinned) {
          // Still opaque: a header that is about to pin should not change
          // colour as it does, and a fitting table's header sits on the same
          // surface either way.
          return {
            ...props,
            xstyle: [...props.xstyle, stickyHeaderStyles.headerCell],
          };
        }
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            style: {
              ...props.htmlProps.style,
              // These composition-critical properties are inline so a later
              // plugin class (notably column resize's relative positioning)
              // cannot disable pinning. Preserve a higher existing tier so the
              // sticky-column corner remains above both header and body runs in
              // either plugin order.
              position: 'sticky',
              insetBlockStart: 0,
              zIndex:
                typeof props.htmlProps.style?.zIndex === 'number'
                  ? Math.max(
                      props.htmlProps.style.zIndex,
                      STICKY_TIER.HEADER_ROW,
                    )
                  : (props.htmlProps.style?.zIndex ?? STICKY_TIER.HEADER_ROW),
            },
          },
          xstyle: [...props.xstyle, stickyHeaderStyles.headerCell],
        };
      },
    }),
    [
      getViewportProps,
      isPinned,
      maxBlockSize,
      publishHeaderExtent,
      registerContent,
    ],
  );
}
