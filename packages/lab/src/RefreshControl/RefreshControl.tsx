// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RefreshControl.tsx
 * @input Uses React, StyleX, Astryx core theme tokens and utilities,
 *   useRefreshControl
 * @output Exports RefreshControl and RefreshControlProps
 * @position Lab implementation; consumed by packages/lab/src/index.ts
 *
 * Pull to refresh for the content it wraps, inside a ScrollableArea (or any
 * scroll container) or on the page. The content itself is pulled; the
 * indicator stays at the top of the scroll view in the gap a pull opens, as
 * UIRefreshControl does, and the content's edge covers it on the way back.
 * The title (optional) sits under the indicator.
 *
 * The indicator is a stand-in spoke spinner until the activity indicator's
 * own drawing lands: UIKit's eight spokes revealed by the pull on its reveal
 * curve (a CSS custom property the pull writes), stepping round once the
 * refresh starts (a Web Animation the hook runs, on the compositor).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/RefreshControl/RefreshControl.doc.mjs
 * - /packages/lab/src/RefreshControl/RefreshControl.test.tsx
 * - /packages/lab/src/RefreshControl/index.ts
 * - /apps/storybook/stories/RefreshControl.stories.tsx
 */

import type {ReactNode, Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useMergedRefs} from '@astryxdesign/core/hooks';
import {refreshControl} from '@astryxdesign/core/motion/uikit/refresh';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {REFRESH_HEIGHT} from './refreshPull';
import {
  REFRESH_REVEAL_VAR,
  REFRESH_SPIN_STEP_VAR,
  useRefreshControl,
  type UseRefreshControlOptions,
} from './useRefreshControl';

const SPOKES = refreshControl.indicatorSpokes;
const REVEAL = `var(${REFRESH_REVEAL_VAR}, 0)`;
const SPIN_STEP = `var(${REFRESH_SPIN_STEP_VAR}, 0)`;

/**
 * A spoke's opacity, as UIKit's replicator draws it: the layer's opacity is
 * the reveal, and each spoke is fainter than the one before by the alpha
 * offset (reveal − 1 while pulling, so the spokes fill in one after another;
 * the spin's step while spinning).
 */
function spokeOpacity(index: number): string {
  return `calc(${REVEAL} * clamp(0, 1 + ${index} * (${REVEAL} - 1 + ${SPIN_STEP}), 1))`;
}

const styles = stylex.create({
  root: {
    position: 'relative',
  },
  // Rides on the content's top edge and clips the indicator to the gap above
  // it: the content's edge covers the pinned indicator as it comes back.
  indicatorClip: {
    position: 'absolute',
    insetInline: 0,
    bottom: '100%',
    // Taller than any pull: the indicator stays inside it.
    height: '100lvh',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    insetInline: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    pointerEvents: 'none',
  },
  // UIRefreshControl's band, at the bottom of the clip: the hook moves it
  // against the content so it stays at the top of the scroll view.
  indicatorBand: (height: number) => ({
    bottom: 0,
    height,
  }),
  // Stand-in glyph geometry (20 pt, like UIActivityIndicatorView's medium
  // style) until the activity indicator's own drawing lands.
  spokes: {
    position: 'relative',
    flexShrink: 0,
    width: 20,
    height: 20,
  },
  spoke: (transform: string, opacity: string) => ({
    position: 'absolute',
    top: 0,
    insetInlineStart: 9,
    width: 2,
    height: 6,
    borderRadius: 1,
    backgroundColor: colorVars['--color-text-secondary'],
    transformOrigin: '1px 10px',
    transform,
    opacity,
    // Each spoke is its own compositor layer: the pull changes its opacity
    // every move (through the reveal), and a composited opacity changes
    // without a repaint.
    willChange: 'opacity',
  }),
  title: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
    // SYNC: REFRESH_REVEAL_VAR in useRefreshControl.ts
    opacity: 'var(--astryx-refresh-reveal, 0)',
    // Composited, as the spokes: the reveal changes it every move.
    willChange: 'opacity',
  },
});

export interface RefreshControlProps
  extends BaseProps<HTMLElement>, UseRefreshControlOptions {
  /** Ref forwarded to the root element (the pulled content). */
  ref?: Ref<HTMLDivElement>;
  /** The scrolled content (a List, a feed). */
  children: ReactNode;
  /** Text under the indicator, such as when the content was last updated. */
  title?: ReactNode;
}

/**
 * Pull to refresh, as UIRefreshControl: pulling the content down past the
 * top reveals the indicator; pulling past the trigger starts a refresh with
 * the finger still down; letting go settles the content onto the refreshing
 * inset until the refresh ends.
 *
 * Under a finger (a coarse primary pointer, on iOS and Android alike); on
 * the page it replaces the browser's own pull to refresh near the top. A
 * mouse or trackpad has no pull. Always give people
 * another way to refresh (a button that calls `onRefresh` and sets
 * `isRefreshing`), since a pull has no keyboard or assistive-technology
 * equivalent.
 *
 * @example
 * ```
 * <ScrollableArea label="Inbox" height="100%">
 *   <RefreshControl onRefresh={() => reload()} title="Updated just now">
 *     <List>…</List>
 *   </RefreshControl>
 * </ScrollableArea>
 * ```
 */
export function RefreshControl({
  children,
  title,
  onRefresh,
  isRefreshing,
  isDisabled,
  xstyle,
  className,
  style,
  ref,
  ...props
}: RefreshControlProps) {
  const control = useRefreshControl({onRefresh, isRefreshing, isDisabled});
  const rootRef = useMergedRefs(ref, control.contentRef);
  const spokes = [];
  for (let index = 0; index < SPOKES; index++) {
    spokes.push(
      <span
        key={index}
        {...stylex.props(
          styles.spoke(
            `rotate(${(index * 360) / SPOKES}deg)`,
            spokeOpacity(index),
          ),
        )}
      />,
    );
  }
  return (
    <div
      ref={rootRef}
      aria-busy={control.isRefreshing || undefined}
      {...mergeProps(
        themeProps('refresh-control'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {children}
      {/* After the content: a spinning indicator painted before the rows would
          have WebKit give every row after it a layer of its own. */}
      <div aria-hidden {...stylex.props(styles.indicatorClip)}>
        <div
          ref={control.indicatorRef}
          {...stylex.props(
            styles.indicator,
            styles.indicatorBand(REFRESH_HEIGHT),
          )}>
          <span ref={control.spinnerRef} {...stylex.props(styles.spokes)}>
            {spokes}
          </span>
          {title != null ? (
            <span ref={control.titleRef} {...stylex.props(styles.title)}>
              {title}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
