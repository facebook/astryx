// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file railMotion.ts
 * @input The rail's outer element and, inside AppShell, the content column
 *   and the main content element; the size-change module's motion
 *   (motion/animatedLayout.ts)
 * @output Exports `SideNavShellContext` (the elements AppShell lends its
 *   SideNav), `snapshotRail` and `playRail`: the rail's collapse motion
 * @position Internal to SideNav (`component:SideNav` FR6, DEC-2;
 *   `component:AppShell` FR17)
 *
 * Collapsing or expanding the rail plays one motion on one clock, the
 * `springs.settle` role the size-change glide reads (`spec:AST-105` FR4):
 * - Layout snaps to the final rail width at once; nothing animates a width.
 * - The rail covers or reveals by a clip on its outer element, which paints
 *   its background. A collapse lays a copy of the old, expanded rail over the
 *   real collapsed one and clips the copy down to the new width; the copy's
 *   text fades over the first 40% and the copy over the last 30%, so the real
 *   rail, icons only, is all that remains. An expand clips the real rail open
 *   from the old width, under a copy of the old, collapsed rail that fades
 *   over the last 60%.
 * - The content column slides from its old place to its new one (the rail's
 *   sibling, as the glide moves siblings), carrying an in-place swap
 *   (`spec:AST-105` FR8): a copy of the old wrap at the old width fades out
 *   over the new wrap, which fades in. On an expand the column's background
 *   reaches over the gap its slide opens.
 * - Every starting clip and translate applies in the commit's layout effect,
 *   before the first frame paints.
 * - Under Reduce Motion it follows `design:reduced-motion`: opacity only
 *   under a coarse primary pointer (DR2), an immediate change otherwise
 *   (DR3). Without Web Animations, the change lands at once.
 *
 * SYNC: When modified, update SideNav.tsx, AppShell.tsx and
 * SideNavRailMotion.test.tsx.
 */

import {createContext} from 'react';
import {layoutMotionFor} from '../motion/animatedLayout';

/** The elements AppShell lends its SideNav; outside AppShell, none. */
export interface SideNavShell {
  /** The rail's outer element, which paints its background. */
  rail(): HTMLElement | null;
  /** The column beside the rail that slides. */
  column(): HTMLElement | null;
  /** The element whose children are the page's wrap. */
  content(): HTMLElement | null;
}

export const SideNavShellContext = createContext<SideNavShell | null>(null);
SideNavShellContext.displayName = 'SideNavShellContext';

/** Above this many elements the old wrap is not copied; the new one fades in. */
const MAX_COPIED_ELEMENTS = 1500;

export interface RailSnapshot {
  readonly rail: HTMLElement;
  readonly railRect: DOMRect;
  readonly railCopy: HTMLElement;
  readonly columnRect: DOMRect | null;
  readonly wrapCopy: HTMLElement | null;
}

/** A copy that takes no part: hidden from assistive technology, inert, no ids. */
function copyOf(element: HTMLElement): HTMLElement {
  const copy = element.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll('[id], [data-testid]')]) {
    node.removeAttribute('id');
    node.removeAttribute('data-testid');
  }
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.style.pointerEvents = 'none';
  return copy;
}

const running = new WeakMap<HTMLElement, () => void>();

/** Before the change commits: the old rail and wrap, and where they were. */
export function snapshotRail(
  rail: HTMLElement | null,
  shell: SideNavShell | null,
): RailSnapshot | null {
  if (rail == null || typeof rail.animate !== 'function') {
    return null;
  }
  running.get(rail)?.();
  const column = shell?.column() ?? null;
  const content = shell?.content() ?? null;
  let wrapCopy: HTMLElement | null = null;
  if (
    content != null &&
    content.getElementsByTagName('*').length <= MAX_COPIED_ELEMENTS
  ) {
    const style = getComputedStyle(content);
    wrapCopy = copyOf(content);
    wrapCopy.removeAttribute('role');
    wrapCopy.removeAttribute('tabindex');
    Object.assign(wrapCopy.style, {
      position: 'absolute',
      insetBlockStart: '0px',
      insetInlineStart: '0px',
      boxSizing: 'border-box',
      width: `${content.clientWidth}px`,
      padding: style.padding,
      margin: '0px',
      overflow: 'visible',
      translate: 'none',
    });
  }
  return {
    rail,
    railRect: rail.getBoundingClientRect(),
    railCopy: copyOf(rail),
    columnRect: column?.getBoundingClientRect() ?? null,
    wrapCopy,
  };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** After the change commits, before paint: play the motion from the snapshot. */
export function playRail(
  snapshot: RailSnapshot,
  shell: SideNavShell | null,
): void {
  const {rail, railRect, railCopy, columnRect, wrapCopy} = snapshot;
  const motion = layoutMotionFor(rail);
  const next = rail.getBoundingClientRect();
  const delta = next.width - railRect.width;
  if (motion.kind === 'instant' || Math.abs(delta) < 0.5) {
    return;
  }
  const rtl = getComputedStyle(rail).direction === 'rtl';
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
  const inset = (px: number) =>
    rtl ? `inset(0px 0px 0px ${px}px)` : `inset(0px ${px}px 0px 0px)`;
  const now = rail.ownerDocument.timeline?.currentTime ?? null;
  const animations: Animation[] = [];
  const play = (element: Element, keyframes: Keyframe[]) => {
    const animation = (element as HTMLElement).animate(keyframes, timing);
    if (now != null) {
      animation.startTime = now;
    }
    animations.push(animation);
  };
  const added: HTMLElement[] = [];
  const restore: (() => void)[] = [];

  // The rail: a copy of the old one over the real new one.
  const parent = rail.parentElement ?? rail.ownerDocument.body;
  const parentRect = parent.getBoundingClientRect();
  Object.assign(railCopy.style, {
    position: 'absolute',
    zIndex: '1',
    margin: '0px',
    insetBlockStart: `${railRect.top - parentRect.top + parent.scrollTop}px`,
    insetInlineStart: `${rtl ? parentRect.right - railRect.right : railRect.left - parentRect.left}px`,
    width: `${railRect.width}px`,
    height: `${railRect.height}px`,
  });
  if (getComputedStyle(parent).position === 'static') {
    const previous = parent.style.position;
    parent.style.position = 'relative';
    restore.push(() => (parent.style.position = previous));
  }
  parent.appendChild(railCopy);
  added.push(railCopy);
  if (!travels) {
    play(
      railCopy,
      frames(p => ({opacity: 1 - p})),
    );
    play(
      rail,
      frames(p => ({opacity: p})),
    );
  } else if (delta < 0) {
    play(
      railCopy,
      frames(p => ({
        clipPath: inset(-delta * p),
        opacity: 1 - clamp((p - 0.7) / 0.3),
      })),
    );
    // The copy's text fades first, so no label shows in the collapsed width.
    const walker = railCopy.ownerDocument.createTreeWalker(railCopy, 4);
    const texts: Text[] = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim()) {
        texts.push(walker.currentNode as Text);
      }
    }
    for (const text of texts) {
      const span = railCopy.ownerDocument.createElement('span');
      text.replaceWith(span);
      span.appendChild(text);
      play(
        span,
        frames(p => ({opacity: 1 - clamp(p / 0.4)})),
      );
    }
  } else {
    play(
      rail,
      frames(p => ({clipPath: inset(delta * (1 - p))})),
    );
    play(
      railCopy,
      frames(p => ({opacity: 1 - clamp((p - 0.4) / 0.6)})),
    );
  }

  // The content: the column slides, carrying the old wrap's copy out.
  const column = shell?.column() ?? null;
  const content = shell?.content() ?? null;
  if (column != null && columnRect != null) {
    const nextColumn = column.getBoundingClientRect();
    const travel = rtl
      ? columnRect.right - nextColumn.right
      : columnRect.left - nextColumn.left;
    if (travels && Math.abs(travel) >= 0.5) {
      const background = getComputedStyle(column).backgroundColor;
      const reach =
        travel < 0 && !/rgba\(.*,\s*0\)|transparent/.test(background);
      play(
        column,
        frames(p => ({
          translate: `${travel * (1 - p)}px 0px`,
          ...(reach && {
            boxShadow: `${(rtl ? travel : -travel) * (1 - p)}px 0px 0px 0px ${background}`,
          }),
        })),
      );
    }
    if (content != null) {
      for (const child of content.children) {
        play(
          child,
          frames(p => ({opacity: p})),
        );
      }
      if (wrapCopy != null) {
        if (getComputedStyle(content).position === 'static') {
          const previous = content.style.position;
          content.style.position = 'relative';
          restore.push(() => (content.style.position = previous));
        }
        content.appendChild(wrapCopy);
        added.push(wrapCopy);
        play(
          wrapCopy,
          frames(p => ({opacity: 1 - p})),
        );
      }
    }
  }

  let done = false;
  const end = () => {
    if (done) {
      return;
    }
    done = true;
    running.delete(rail);
    animations.forEach(animation => animation.cancel());
    added.forEach(element => element.remove());
    restore.forEach(undo => undo());
  };
  running.set(rail, end);
  // Every part runs on one clock, so the first to finish ends them all.
  animations[0]?.addEventListener('finish', end);
}
