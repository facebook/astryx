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
 * The title (optional) sits under the indicator, a status line for assistive
 * technology; the spinner is decoration, hidden from it.
 *
 * The indicator is UIRefreshControl's replicator, drawn from the refresh
 * table: eight capsule spokes revealed one after another by the pull (a CSS
 * custom property the pull writes) and, once the refresh starts, a gradient
 * that springs in and steps round clockwise every eighth of a second. The
 * eight capsules are drawn once, one element each: a layer in the text color
 * masked to its capsule already drawn at its angle (one frame of an
 * eight-frame sprite), so nothing is resampled at rest. The spin is the
 * hook's: each spoke steps its opacity on a Web Animation, a compositor
 * animation that keeps turning while a script runs. At the trigger the
 * spokes start stepping and the hook fades a transient copy of them, as the
 * pull left them, out over them on the gradient spring: UIKit's
 * cross-fade, so a theme that retunes `refreshControl.triggerGradientSpring`
 * retunes it, and under Reduce Motion the shared 200 ms opacity fade
 * (nothing travels). The copy is removed when its fade ends.
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
  useRefreshControl,
  type UseRefreshControlOptions,
} from './useRefreshControl';

const SPOKES = refreshControl.indicatorSpokes;
const REVEAL = `var(${REFRESH_REVEAL_VAR}, 0)`;

/**
 * A spoke's opacity while the pull reveals it, as UIKit's replicator draws
 * it: the layer's opacity is the reveal, and each spoke is fainter than the
 * one before by the alpha offset (reveal − 1), so the spokes fill in one
 * after another. At the trigger every spoke is at full alpha.
 */
function revealOpacity(index: number): string {
  return `calc(${REVEAL} * clamp(0, 1 + ${index} * (${REVEAL} - 1), 1))`;
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
  // The indicator: the spokes reach 15 pt from its center (30 pt across,
  // `spokeOuterRadiusPt` twice; StyleX needs the literal).
  glyph: {
    position: 'relative',
    flexShrink: 0,
    width: 30,
    height: 30,
  },
  // One element per spoke, the glyph's whole box: the text color masked to
  // the spoke's capsule, drawn at its angle in its frame of the sprite
  // (`spokeFrames` picks the frame). The capsules are the table's: 3.67 pt
  // wide with 1.83 pt corners, from 5 to 15 pt out; RefreshControl.test.tsx
  // rebuilds the sprite from refresh.ts.
  spoke: {
    position: 'absolute',
    inset: 0,
    // Under forced colors a background becomes the page's Canvas, which would
    // hide every spoke; the spokes keep the system text color instead.
    backgroundColor: {
      default: colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'CanvasText',
    },
    forcedColorAdjust: {
      default: null,
      '@media (forced-colors: active)': 'none',
    },
    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 30'%3E%3Crect x='13.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(0 15 15)'/%3E%3Crect x='43.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(45 45 15)'/%3E%3Crect x='73.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(90 75 15)'/%3E%3Crect x='103.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(135 105 15)'/%3E%3Crect x='133.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(180 135 15)'/%3E%3Crect x='163.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(225 165 15)'/%3E%3Crect x='193.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(270 195 15)'/%3E%3Crect x='223.165' y='0' width='3.67' height='10' rx='1.83' transform='rotate(315 225 15)'/%3E%3C/svg%3E")`,
    maskRepeat: 'no-repeat',
    maskSize: '800% 100%',
  },
  spokeOpacity: (opacity: string) => ({
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
  /**
   * Text under the indicator, such as when the content was last updated.
   * Assistive technology reads it as a status line, so a new title is
   * announced.
   */
  title?: ReactNode;
}

// Each spoke's frame of the sprite: spoke k drawn k × 45° clockwise from 12
// o'clock.
const spokeFrames = stylex.create({
  s0: {maskPosition: '0% 0%'},
  s1: {maskPosition: '14.2857% 0%'},
  s2: {maskPosition: '28.5714% 0%'},
  s3: {maskPosition: '42.8571% 0%'},
  s4: {maskPosition: '57.1429% 0%'},
  s5: {maskPosition: '71.4286% 0%'},
  s6: {maskPosition: '85.7143% 0%'},
  s7: {maskPosition: '100% 0%'},
});

/** Each spoke's frame, in spoke order. */
const SPOKE_FRAMES = [
  spokeFrames.s0,
  spokeFrames.s1,
  spokeFrames.s2,
  spokeFrames.s3,
  spokeFrames.s4,
  spokeFrames.s5,
  spokeFrames.s6,
  spokeFrames.s7,
];

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
  // The eight capsules, drawn once: each spoke shows the reveal's opacity
  // while the pull reveals it and its phase of the gradient while spinning
  // (at the trigger the hook fades a transient copy of them out over them).
  const spokes = Array.from({length: SPOKES}, (_, index) => (
    <span
      key={index}
      {...stylex.props(
        styles.spoke,
        SPOKE_FRAMES[index],
        styles.spokeOpacity(revealOpacity(index)),
      )}
    />
  ));
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
      <div {...stylex.props(styles.indicatorClip)}>
        <div
          ref={control.indicatorRef}
          {...stylex.props(
            styles.indicator,
            styles.indicatorBand(REFRESH_HEIGHT),
          )}>
          {/* Decoration: the busy state and the announcement carry it. */}
          <span
            ref={control.spinnerRef}
            aria-hidden
            {...stylex.props(styles.glyph)}>
            {spokes}
          </span>
          {title != null ? (
            // A status line, so a new title (after a refresh) is announced.
            <span
              ref={control.titleRef}
              role="status"
              {...stylex.props(styles.title)}>
              {title}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
