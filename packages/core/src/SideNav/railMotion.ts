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
 *   fading in over the last 60% so no label shows at the collapsed width. No
 *   copy.
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

export interface RailSnapshot {
  readonly rail: HTMLElement;
  readonly railRect: DOMRect;
  /** The old rail, for a collapse to cover. */
  readonly swap: LayoutSwap | null;
}

/** Before the change commits: the old rail and where it was. */
export function snapshotRail(
  rail: HTMLElement | null,
  handle: AnimatedLayout,
): RailSnapshot | null {
  if (rail == null || typeof rail.animate !== 'function') {
    return null;
  }
  return {
    rail,
    railRect: rail.getBoundingClientRect(),
    swap: holdLayoutSwap(handle, rail),
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

/**
 * After the change commits, before paint: play the rail's motion from the
 * snapshot. Returns what ends it at once (an unmount mid-motion).
 */
export function playRail(
  snapshot: RailSnapshot,
  current: HTMLElement | null,
): () => void {
  const {railRect, swap} = snapshot;
  // The rail as it is now: a resizable rail's nav remounts when its resize
  // wrapper comes and goes with the collapse.
  const rail = current?.isConnected === true ? current : snapshot.rail;
  if (!rail.isConnected) {
    return () => {};
  }
  const motion = layoutMotionFor(rail);
  const next = rail.getBoundingClientRect();
  const delta = next.width - railRect.width;
  if (motion.kind === 'instant' || Math.abs(delta) < 0.5) {
    return () => {};
  }
  const rtl = getComputedStyle(rail).direction === 'rtl';
  const inset = (px: number) =>
    rtl ? `inset(0px 0px 0px ${px}px)` : `inset(0px ${px}px 0px 0px)`;

  if (delta < 0) {
    // A collapse covers the old rail, held by the swap.
    if (swap == null || rail.parentElement == null) {
      return () => {};
    }
    // The copy keeps the rail's inline-start edge where the rail is now, so
    // it closes onto the real rail wherever SideNav sits (a centered rail
    // moves when it narrows).
    const at = DOMRect.fromRect({
      x: rtl ? next.right - railRect.width : next.left,
      y: next.top,
      width: railRect.width,
      height: railRect.height,
    });
    return playLayoutSwap(
      {...swap, rect: at},
      {
        host: rail.parentElement,
        isOpaque: true,
        copy: p => ({
          clipPath: inset(-delta * p),
          opacity: 1 - clamp((p - 0.7) / 0.3),
        }),
        copyText: p => 1 - clamp(p / 0.4),
        incoming: [
          {element: rail, frames: p => ({opacity: clamp((p - 0.7) / 0.3)})},
        ],
      },
    );
  }

  // An expand reveals the real rail; the copy the snapshot held is unused.
  const travels = motion.kind === 'spring';
  const duration = travels ? motion.progress.durationMs : motion.durationMs;
  const timing: KeyframeAnimationOptions = {
    duration,
    easing: travels ? 'linear' : motion.easing,
    fill: 'both',
  };
  // Progress 0 → 1: spring-sampled frames, or two frames under a fade.
  const frames = (frame: (p: number) => Keyframe): Keyframe[] => {
    if (!travels) {
      return [frame(0), frame(1)];
    }
    const count = Math.max(2, Math.ceil(duration / (1000 / 60)) + 1);
    return Array.from({length: count}, (_, i) => {
      const offset = i / (count - 1);
      const p = 1 - motion.progress.remaining(offset * duration);
      return {...frame(p), offset};
    });
  };
  const now = rail.ownerDocument.timeline?.currentTime ?? null;
  const animations: Animation[] = [];
  const play = (element: Element, keyframes: Keyframe[]) => {
    const animation = (element as HTMLElement).animate(keyframes, timing);
    if (now != null) {
      animation.startTime = now;
    }
    animations.push(animation);
  };
  if (travels) {
    play(
      rail,
      frames(p => ({clipPath: inset(delta * (1 - p))})),
    );
    for (const element of textElements(rail)) {
      play(
        element,
        frames(p => ({opacity: clamp((p - 0.4) / 0.6)})),
      );
    }
  } else {
    play(
      rail,
      frames(p => ({opacity: p})),
    );
  }
  let isDone = false;
  const end = () => {
    if (!isDone) {
      isDone = true;
      animations.forEach(animation => animation.cancel());
    }
  };
  // Every part runs on one clock, so the first to finish ends them all.
  animations[0]?.addEventListener('finish', end);
  return end;
}
