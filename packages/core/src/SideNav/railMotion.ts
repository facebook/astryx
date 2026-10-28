// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file railMotion.ts
 * @input The rail's outer element, the animated-layout module's handle,
 *   motion and in-place swap (motion/animatedLayout.ts)
 * @output Exports `SideNavShellContext` (what AppShell lends its SideNav),
 *   `createRailLayout`, `snapshotRail` and `playRail`: the rail's collapse
 *   motion
 * @position Internal to SideNav (`component:SideNav` FR6, DEC-2); AppShell's
 *   content area moves through the context (`component:AppShell` FR17)
 *
 * Collapsing or expanding the rail plays one motion on one clock, the
 * `springs.settle` role the animated-layout module reads (`spec:AST-105`
 * FR4):
 * - Layout snaps to the final rail width at once; nothing animates a width.
 * - A collapse covers the old rail by a clip: the module's in-place swap
 *   (`spec:AST-105` FR8) holds the old, expanded rail as one transient copy
 *   over the real collapsed one and the clip closes it to the new width. The
 *   copy's text fades over the first 40%, and over the last 30% the copy
 *   fades out as the real rail fades in, so the real rail, icons only, is all
 *   that remains.
 * - An expand reveals the real rail by a clip from the old width, its text
 *   fading in over the last 60% so no label shows at the collapsed width,
 *   under the old, collapsed rail held by the same swap, which fades over the
 *   first 60%: the first frame is the frame before the click.
 * - A change made during a running motion starts from what the rail shows:
 *   its width, its labels' opacity and its collapsed icons' opacity, so the
 *   rail stays continuous.
 * - Every starting clip applies in the commit's layout effect, before the
 *   first frame paints.
 * - Under Reduce Motion it follows `design:reduced-motion`: opacity only
 *   under a coarse primary pointer (DR2), an immediate change otherwise
 *   (DR3). Without Web Animations, the change lands at once.
 *
 * SYNC: When modified, update SideNav.tsx, AppShell.tsx and
 * SideNavRailMotion.test.tsx.
 */

import {createContext} from 'react';
import {
  createAnimatedLayout,
  holdLayoutSwap,
  layoutMotionFor,
  playLayoutFrames,
  playLayoutSwap,
  type AnimatedLayout,
  type LayoutSwap,
} from '../motion/animatedLayout';

/** What AppShell lends its SideNav; outside AppShell, nothing. */
export interface SideNavShell {
  /** AppShell's own handle, whose area holds the rail and the content. */
  readonly animatedLayout: AnimatedLayout;
  /** The rail's outer element, which paints its background. */
  rail(): HTMLElement | null;
  /** In the commit, before the DOM changes: the content measures itself. */
  beforeRailChange(): void;
  /** After it, before paint: the content moves; returns what ends it. */
  afterRailChange(): () => void;
}

export const SideNavShellContext = createContext<SideNavShell | null>(null);
SideNavShellContext.displayName = 'SideNavShellContext';

/** A SideNav outside AppShell holds its own handle over its parent. */
export function createRailLayout(
  rail: () => HTMLElement | null,
): AnimatedLayout {
  return createAnimatedLayout(() => rail()?.parentElement ?? null);
}

/** What a rail shows: at rest, or partway through a motion. */
export interface RailShown {
  readonly width: number;
  /** The labels' opacity. */
  readonly labels: number;
  /** The collapsed rail's opacity (its icons). */
  readonly collapsed: number;
}

export interface RailSnapshot {
  readonly rail: HTMLElement;
  readonly railRect: DOMRect;
  /** What the rail shows when the change lands. */
  readonly shown: RailShown;
  /**
   * A running expand's copy of the collapsed rail, taken over where and as
   * it shows, for the collapse that reverses it.
   */
  readonly carried: HTMLElement | null;
  /** The old rail, held by the swap. */
  readonly swap: LayoutSwap | null;
}

/** A playing rail motion. */
export interface RailMotion {
  /** Ends it at once (a new change, an unmount). */
  end(): void;
  /** What the rail shows now, or null once it has settled. */
  shown(): RailShown | null;
  /** Takes over a running expand's copy of the collapsed rail (or null). */
  handOff(): HTMLElement | null;
}

/**
 * Before the change commits: the old rail, where it was, and what it shows,
 * from a running motion or at rest.
 */
export function snapshotRail(
  rail: HTMLElement | null,
  handle: AnimatedLayout,
  running: RailShown | null,
  isCollapsed: boolean,
  carried: HTMLElement | null = null,
): RailSnapshot | null {
  if (rail == null || typeof rail.animate !== 'function') {
    return null;
  }
  const railRect = rail.getBoundingClientRect();
  return {
    rail,
    railRect,
    shown: running ?? {
      width: railRect.width,
      labels: isCollapsed ? 0 : 1,
      collapsed: isCollapsed ? 1 : 0,
    },
    swap: holdLayoutSwap(handle, rail),
    carried,
  };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** The rail's own text: elements that hold a run of text directly. */
function textElements(rail: HTMLElement): Element[] {
  return Array.from(rail.querySelectorAll('*')).filter(element =>
    Array.from(element.childNodes).some(
      node => node.nodeType === 3 && node.textContent?.trim(),
    ),
  );
}

const AT_REST: RailMotion = {
  end: () => {},
  shown: () => null,
  handOff: () => null,
};

/**
 * After the change commits, before paint: play the rail's motion from the
 * snapshot, on the module's motion.
 */
export function playRail(
  snapshot: RailSnapshot,
  current: HTMLElement | null,
  handle: AnimatedLayout,
): RailMotion {
  const {railRect, swap, shown: from, carried} = snapshot;
  // The rail as it is now: a resizable rail's nav remounts when its resize
  // wrapper comes and goes with the collapse.
  const rail = current?.isConnected === true ? current : snapshot.rail;
  if (!rail.isConnected) {
    carried?.remove();
    return AT_REST;
  }
  const motion = layoutMotionFor(rail);
  const next = rail.getBoundingClientRect();
  if (motion.kind === 'instant' || Math.abs(next.width - from.width) < 0.5) {
    carried?.remove();
    return AT_REST;
  }
  const isCollapse = next.width < from.width;
  // The labels and the collapsed icons over the motion's progress, from what
  // the rail showed.
  const labelsAt = (p: number) =>
    isCollapse
      ? from.labels * (1 - clamp(p / 0.4))
      : from.labels + (1 - from.labels) * clamp((p - 0.4) / 0.6);
  const collapsedAt = (p: number) =>
    isCollapse
      ? from.collapsed + (1 - from.collapsed) * clamp((p - 0.7) / 0.3)
      : from.collapsed * (1 - clamp(p / 0.6));
  const now = () => Number(rail.ownerDocument.timeline?.currentTime ?? 0);
  const startedAt = now();
  const durationMs =
    motion.kind === 'spring' ? motion.progress.durationMs : motion.durationMs;
  const shown = (): RailShown | null => {
    const elapsed = now() - startedAt;
    if (elapsed >= durationMs) {
      return null;
    }
    const p =
      motion.kind === 'spring' ? 1 - motion.progress.remaining(elapsed) : 0;
    return {
      width: from.width + (next.width - from.width) * p,
      labels: labelsAt(p),
      collapsed: collapsedAt(p),
    };
  };
  const rtl = getComputedStyle(rail).direction === 'rtl';
  const inset = (px: number) =>
    rtl ? `inset(0px 0px 0px ${px}px)` : `inset(0px ${px}px 0px 0px)`;
  // The copy keeps the rail's inline-start edge where the rail is now, so it
  // meets the real rail wherever SideNav sits (a centered rail moves).
  const at = DOMRect.fromRect({
    x: rtl ? next.right - railRect.width : next.left,
    y: next.top,
    width: railRect.width,
    height: railRect.height,
  });
  const host = rail.parentElement;

  if (isCollapse) {
    // A collapse covers the old rail, held by the swap, from the width it
    // shows down to the new one; the real, collapsed rail fades in under it.
    if (swap == null || host == null) {
      carried?.remove();
      return AT_REST;
    }
    // Reversing an expand: its copy of the collapsed rail stays on top, from
    // the opacity it shows, and settles in as the collapsed rail it ends as.
    let carriedFrom = 0;
    if (carried != null) {
      carried.style.zIndex = '2';
      carriedFrom = Number(carried.style.opacity || 1);
    }
    const startInset = railRect.width - from.width;
    const endInset = railRect.width - next.width;
    const end = playLayoutSwap(
      {...swap, rect: at},
      {
        host,
        isOpaque: true,
        copy: p => ({
          clipPath: inset(startInset + (endInset - startInset) * p),
          opacity: 1 - clamp((p - 0.7) / 0.3),
        }),
        copyText: labelsAt,
        onEnd: () => carried?.remove(),
        incoming: [
          {element: rail, frames: p => ({opacity: collapsedAt(p)})},
          ...(carried == null
            ? []
            : [
                {
                  element: carried,
                  frames: (p: number) => ({
                    opacity: carriedFrom + (1 - carriedFrom) * clamp(p / 0.4),
                  }),
                },
              ]),
        ],
      },
    );
    return {end, shown, handOff: () => null};
  }

  // An expand reveals the real rail from the width it showed, its text fading
  // in late, under the old, collapsed rail fading early.
  const reveal = next.width - from.width;
  const incoming = [
    {
      element: rail,
      frames: (p: number) => ({clipPath: inset(reveal * (1 - p))}),
    },
    ...textElements(rail).map(element => ({
      element,
      frames: (p: number) => ({opacity: labelsAt(p)}),
    })),
  ];
  carried?.remove();
  const playback =
    swap != null && host != null
      ? playLayoutSwap(
          {...swap, rect: at},
          {
            host,
            isOpaque: true,
            copy: p => ({opacity: collapsedAt(p)}),
            incoming,
          },
        )
      : null;
  return {
    end: playback ?? playLayoutFrames(handle, incoming),
    shown,
    // The collapsed rail's copy, for a collapse that reverses this expand.
    handOff: () => playback?.handOff() ?? null,
  };
}
