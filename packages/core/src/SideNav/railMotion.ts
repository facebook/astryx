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
 *   text fades over the first 40% and, over the last 30%, the copy fades out
 *   as the real rail fades in, so the real rail, icons only, is all that
 *   remains. An expand clips a copy of the new
 *   rail open from the old width, its text fading in over the last 60% so no
 *   label shows at the collapsed width, while the real rail waits under it.
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
  /** The old wrap, and the content's visible part it filled. */
  readonly wrapCopy: HTMLElement | null;
  readonly wrapRect: DOMRect | null;
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

/** The background `element` shows: its own, or the nearest ancestor's. */
function paintedBackground(element: HTMLElement): string {
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(color)) {
      return color;
    }
  }
  return 'Canvas';
}

/**
 * Lay `element` over `rect` (viewport coordinates), absolutely, as the last
 * child of `parent`, wherever its containing block is.
 */
function placeOver(element: HTMLElement, parent: Element, rect: DOMRect) {
  Object.assign(element.style, {
    position: 'absolute',
    margin: '0px',
    left: '0px',
    top: '0px',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  parent.appendChild(element);
  const origin = element.getBoundingClientRect();
  element.style.left = `${rect.left - origin.left}px`;
  element.style.top = `${rect.top - origin.top}px`;
}

/** The nearest ancestor of `element` that generates a box. */
function boxParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement ?? element.ownerDocument.body;
  while (
    parent.parentElement != null &&
    getComputedStyle(parent).display === 'contents'
  ) {
    parent = parent.parentElement;
  }
  return parent;
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
  let wrapRect: DOMRect | null = null;
  if (
    content != null &&
    content.getElementsByTagName('*').length <= MAX_COPIED_ELEMENTS
  ) {
    // The old wrap at the old width, scrolled as it was, in a holder the size
    // of the content's visible part. The holder rides beside the column, not
    // inside the content, which clips.
    const style = getComputedStyle(content);
    const box = content.getBoundingClientRect();
    wrapRect = DOMRect.fromRect({
      x: box.left + content.clientLeft,
      y: box.top + content.clientTop,
      width: content.clientWidth,
      height: content.clientHeight,
    });
    const copy = copyOf(content);
    copy.removeAttribute('role');
    copy.removeAttribute('tabindex');
    Object.assign(copy.style, {
      position: 'absolute',
      top: `${-content.scrollTop}px`,
      left: '0px',
      boxSizing: 'border-box',
      width: `${content.clientWidth}px`,
      height: 'auto',
      padding: style.padding,
      margin: '0px',
      overflow: 'visible',
      translate: 'none',
    });
    wrapCopy = content.ownerDocument.createElement('div');
    wrapCopy.setAttribute('aria-hidden', 'true');
    wrapCopy.setAttribute('inert', '');
    Object.assign(wrapCopy.style, {overflow: 'hidden', pointerEvents: 'none'});
    wrapCopy.appendChild(copy);
  }
  return {
    rail,
    railRect: rail.getBoundingClientRect(),
    railCopy: copyOf(rail),
    columnRect: column?.getBoundingClientRect() ?? null,
    wrapCopy,
    wrapRect,
  };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** After the change commits, before paint: play the motion from the snapshot. */
export function playRail(
  snapshot: RailSnapshot,
  shell: SideNavShell | null,
): void {
  const {rail, railRect, railCopy, columnRect, wrapCopy, wrapRect} = snapshot;
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

  // The rail. A copy over the real rail carries what the real one cannot: a
  // collapse covers a copy of the old, expanded rail; an expand reveals a
  // copy of the new one, whose text fades in. Under a fade, the old rail's
  // copy fades out over the real new one.
  const expands = delta > 0;
  const copy = travels && expands ? copyOf(rail) : railCopy;
  const copyRect = copy === railCopy ? railRect : next;
  placeOver(copy, rail.parentElement ?? rail.ownerDocument.body, copyRect);
  // Opaque, so what is under the copy never shows through its text.
  copy.style.zIndex = '1';
  copy.style.backgroundColor = paintedBackground(rail);
  added.push(copy);
  // The copy's text, so no label shows in the collapsed width.
  const fadeText = (opacity: (p: number) => number) => {
    const walker = copy.ownerDocument.createTreeWalker(copy, 4);
    const texts: Text[] = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim()) {
        texts.push(walker.currentNode as Text);
      }
    }
    for (const text of texts) {
      const span = copy.ownerDocument.createElement('span');
      text.replaceWith(span);
      span.appendChild(text);
      play(
        span,
        frames(p => ({opacity: opacity(p)})),
      );
    }
  };
  if (!travels) {
    play(
      copy,
      frames(p => ({opacity: 1 - p})),
    );
    play(
      rail,
      frames(p => ({opacity: p})),
    );
  } else if (!expands) {
    play(
      copy,
      frames(p => ({
        clipPath: inset(-delta * p),
        opacity: 1 - clamp((p - 0.7) / 0.3),
      })),
    );
    fadeText(p => 1 - clamp(p / 0.4));
    // The real rail fades in as the copy fades out, so the icons cross once.
    play(
      rail,
      frames(p => ({opacity: clamp((p - 0.7) / 0.3)})),
    );
  } else {
    // The real rail waits under its copy: a rail without a background of its
    // own would show its labels through it.
    play(
      rail,
      frames(() => ({opacity: 0})),
    );
    play(
      copy,
      frames(p => ({clipPath: inset(delta * (1 - p))})),
    );
    fadeText(p => clamp((p - 0.4) / 0.6));
  }

  // The content: the column slides, carrying the old wrap's copy out.
  const column = shell?.column() ?? null;
  const content = shell?.content() ?? null;
  if (column != null && columnRect != null) {
    const nextColumn = column.getBoundingClientRect();
    const travel = rtl
      ? columnRect.right - nextColumn.right
      : columnRect.left - nextColumn.left;
    const slides = travels && Math.abs(travel) >= 0.5;
    const host = boxParent(column);
    if (slides) {
      // Nothing the slide carries past the column's edges scrolls the page.
      const previous = host.style.overflow;
      host.style.overflow = 'clip';
      restore.push(() => (host.style.overflow = previous));
      // The content's own background, so the gap matches what it fills.
      const background = getComputedStyle(content ?? column).backgroundColor;
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
      if (wrapCopy != null && wrapRect != null) {
        // The old wrap starts where it was and moves with the column.
        placeOver(wrapCopy, host, wrapRect);
        added.push(wrapCopy);
        play(
          wrapCopy,
          frames(p => ({
            opacity: 1 - p,
            ...(slides && {translate: `${-travel * p}px 0px`}),
          })),
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
