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
    // The old wrap at the old width, scrolled as it was, inside a holder the
    // size of the content's visible part, so it adds no scrollable overflow.
    const style = getComputedStyle(content);
    const copy = copyOf(content);
    copy.removeAttribute('role');
    copy.removeAttribute('tabindex');
    Object.assign(copy.style, {
      position: 'absolute',
      insetBlockStart: `${-content.scrollTop}px`,
      insetInlineStart: '0px',
      boxSizing: 'border-box',
      width: `${content.clientWidth}px`,
      padding: style.padding,
      margin: '0px',
      overflow: 'visible',
      translate: 'none',
    });
    wrapCopy = content.ownerDocument.createElement('div');
    wrapCopy.setAttribute('aria-hidden', 'true');
    wrapCopy.setAttribute('inert', '');
    Object.assign(wrapCopy.style, {
      position: 'absolute',
      insetInlineStart: '0px',
      overflow: 'hidden',
      pointerEvents: 'none',
    });
    wrapCopy.appendChild(copy);
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

  // The rail. A copy over the real rail carries what the real one cannot: a
  // collapse covers a copy of the old, expanded rail; an expand reveals a
  // copy of the new one, whose text fades in. Under a fade, the old rail's
  // copy fades out over the real new one.
  const expands = delta > 0;
  const copy = travels && expands ? copyOf(rail) : railCopy;
  const copyRect = copy === railCopy ? railRect : next;
  const parent = rail.parentElement ?? rail.ownerDocument.body;
  const parentRect = parent.getBoundingClientRect();
  Object.assign(copy.style, {
    position: 'absolute',
    zIndex: '1',
    margin: '0px',
    insetBlockStart: `${copyRect.top - parentRect.top + parent.scrollTop}px`,
    insetInlineStart: `${rtl ? parentRect.right - copyRect.right : copyRect.left - parentRect.left}px`,
    width: `${copyRect.width}px`,
    height: `${copyRect.height}px`,
    // Opaque, so what is under the copy never shows through its text.
    backgroundColor: paintedBackground(rail),
  });
  if (getComputedStyle(parent).position === 'static') {
    const previous = parent.style.position;
    parent.style.position = 'relative';
    restore.push(() => (parent.style.position = previous));
  }
  parent.appendChild(copy);
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
        Object.assign(wrapCopy.style, {
          insetBlockStart: `${content.scrollTop}px`,
          width: `${content.clientWidth}px`,
          height: `${content.clientHeight}px`,
        });
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
