// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ContextMenuLift.tsx
 * @input The trigger element, the lift geometry (contextMenuLiftGeometry.ts), the
 *   context-menu constants and springs, the compositor animator
 * @output Exports useContextMenuLift: the lift layer to render, and lift()
 *   / drop() to show UIKit's lifted preview over a tinted backdrop and to
 *   return it to its place
 * @position The lift presentation of ContextMenu's touch invocation;
 *   ContextMenu.tsx places the menu beside the preview it lifts
 *
 * When a context menu shows on iOS 26.2, the long-pressed view lifts out of
 * the page: a copy of it (UIKit's preview platter) grows on from the size the
 * press gave it to its lifted size, a shadow rising under it, above a backdrop
 * that tints the page (no blur, no zoom); the view itself stays where it is,
 * under the copy. The menu's content fades in from a blur
 * (`playMenuEntrance`). When the menu closes, the copy returns to the view's
 * place on the dismissal spring while the backdrop and the shadow clear.
 *
 * Here the copy is a clone of the trigger (inert, hidden from assistive
 * technology, without ids) in a manual popover rendered next to the trigger
 * (spans, so prose around an inline trigger stays valid), so the page's
 * theme variables still reach it. A block trigger lifts; an inline one keeps
 * the cursor menu. The tint and the shadow are the theme's
 * (`--color-background-backdrop`, `--shadow-high`): UIKit's own are
 * rgba(0.086, 0.082, 0.165, 0.21) and a black shadow at 0.30, radius 20, no
 * offset, shaped by the view's pixels. Position, scale and opacity move on
 * the compositor animator; the menu's blur plays as spring-sampled keyframes.
 * Nothing renders during the motion.
 *
 * SYNC: When modified, update /packages/core/src/ContextMenu/ContextMenu.tsx
 * and /packages/core/src/ContextMenu/__tests__/ContextMenuLift.interaction.browser.spec.ts
 */

import * as stylex from '@stylexjs/stylex';
import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {createAnimator, type Animator} from '../motion/animator';
import {
  SETTLING_EPSILON,
  solveSpring,
  toSpring,
  type SpringDescription,
} from '../motion/spring';
import {contextMenu, springs} from '../motion/uikit';
import {colorVars, shadowVars} from '../theme/tokens.stylex';
import {
  liftedBox,
  type LiftBox,
  type LiftViewport,
} from './contextMenuLiftGeometry';

const LIFT = contextMenu.lift;

const styles = stylex.create({
  // No `display`: a closed popover keeps the browser's display: none (it
  // covers the viewport), and the fixed position blockifies the open one.
  layer: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
    pointerEvents: 'none',
  },
  // The backdrop takes the page's touches while the menu is up, as UIKit's
  // container does: a tap there closes the menu and reaches nothing under it,
  // and a drag there moves nothing.
  backdrop: {
    display: 'block',
    position: 'fixed',
    inset: 0,
    opacity: 0,
    backgroundColor: colorVars['--color-background-backdrop'],
    pointerEvents: 'auto',
    touchAction: 'none',
  },
  // The copy's shadow: a layer behind its content, faded on the compositor.
  shadow: {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    opacity: 0,
    pointerEvents: 'none',
    boxShadow: shadowVars['--shadow-high'],
  },
});

/** Where a lift landed: the view's box, the preview's, and the viewport. */
export interface ContextMenuLiftResult {
  readonly source: LiftBox;
  readonly lifted: LiftBox;
  readonly viewport: LiftViewport;
}

export interface ContextMenuLift {
  /** The layer to render beside the trigger. */
  readonly layer: React.ReactNode;
  /**
   * Lift the trigger: returns where it landed, or null when the layer is not
   * mounted (server, or no popover support).
   */
  lift(): ContextMenuLiftResult | null;
  /** Return the preview to its place and show the trigger again. */
  drop(): void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function viewportOf(doc: Document): LiftViewport {
  const view = doc.defaultView;
  return {
    width: doc.documentElement.clientWidth || view?.innerWidth || 0,
    height: view?.innerHeight ?? doc.documentElement.clientHeight,
  };
}

/**
 * WAAPI keyframes along a spring from 0 to 1, sampled at 60 Hz until it
 * settles (overshoot included): `frame(p)` builds the keyframe at progress p.
 */
function springKeyframes(
  description: SpringDescription,
  frame: (progress: number) => Keyframe,
): {keyframes: Keyframe[]; duration: number} {
  const curve = solveSpring(toSpring(description), {from: 0, to: 1});
  const seconds = Math.max(curve.settleTime(SETTLING_EPSILON), 1 / 60);
  const steps = Math.max(2, Math.ceil(seconds * 60));
  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const progress = i === steps ? 1 : curve.value((i / steps) * seconds);
    keyframes.push({...frame(progress), offset: i / steps});
  }
  return {keyframes, duration: seconds * 1000};
}

function playKeyframes(
  element: HTMLElement,
  description: SpringDescription,
  frame: (progress: number) => Keyframe,
): Animation | null {
  if (typeof element.animate !== 'function') {
    return null;
  }
  const {keyframes, duration} = springKeyframes(description, frame);
  return element.animate(keyframes, {duration, fill: 'forwards'});
}

/**
 * The radius of the shape the trigger shows: its own, or that of its only
 * child when that child fills it (a box shadow follows a box's radius, where
 * UIKit's follows the view's pixels).
 */
function shapeRadius(trigger: HTMLElement): string {
  const own = getComputedStyle(trigger).borderRadius;
  if (Number.parseFloat(own) > 0) {
    return own;
  }
  // The trigger's last child is the cursor anchor.
  const content = [...trigger.children].slice(0, -1);
  if (content.length !== 1) {
    return own;
  }
  const outer = trigger.getBoundingClientRect();
  const inner = content[0].getBoundingClientRect();
  const fills =
    Math.abs(inner.width - outer.width) <= 1 &&
    Math.abs(inner.height - outer.height) <= 1;
  return fills ? getComputedStyle(content[0]).borderRadius : own;
}

/**
 * The menu's entrance beside a lifted preview: its content fades in from a
 * blur on `morphSpring` (Reduced Motion: `springs.menuReducedMotion`).
 */
export function playMenuEntrance(menu: HTMLElement): void {
  const blur = LIFT.menuEntranceBlur;
  playKeyframes(
    menu,
    prefersReducedMotion() ? springs.menuReducedMotion : LIFT.morphSpring,
    progress => ({
      opacity: String(progress),
      filter: `blur(${(blur * Math.max(1 - progress, 0)).toFixed(3)}px)`,
    }),
  );
}

/** A copy of the trigger to lift: inert, unnamed, with no ids to collide. */
function clonePreview(trigger: HTMLElement): HTMLElement {
  const clone = trigger.cloneNode(true) as HTMLElement;
  for (const el of [clone, ...clone.querySelectorAll<HTMLElement>('[id]')]) {
    el.removeAttribute('id');
  }
  clone.removeAttribute('data-testid');
  // The cursor anchor (the trigger's last child) stays with the trigger.
  clone.lastElementChild?.remove();
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('data-astryx-context-menu-preview', '');
  clone.inert = true;
  return clone;
}

export function useContextMenuLift(
  triggerRef: RefObject<HTMLElement | null>,
  {
    onBackdropTap,
  }: {
    /**
     * A finger lifted on the backdrop: UIKit ends the presentation at that
     * lift. (WebKit sends no mouse events for a tap on the bare backdrop, so
     * the document's outside-press handler cannot stand in.)
     */
    onBackdropTap?: () => void;
  } = {},
): ContextMenuLift {
  const onBackdropTapRef = useRef(onBackdropTap);
  onBackdropTapRef.current = onBackdropTap;
  // The pointer that went down on the backdrop: only its lift is a tap there
  // (WebKit hands the backdrop the lift of the finger that opened the menu).
  const backdropPointerRef = useRef<number | null>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const backdropRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const previewAnimatorRef = useRef<Animator | null>(null);
  const backdropAnimatorRef = useRef<Animator | null>(null);
  const shadowAnimatorRef = useRef<Animator | null>(null);
  // Bumps on every lift, so a drop that finishes late leaves a newer lift be.
  const generationRef = useRef(0);

  const cleanUp = useCallback(() => {
    shadowAnimatorRef.current?.dispose();
    shadowAnimatorRef.current = null;
    previewAnimatorRef.current?.dispose();
    previewAnimatorRef.current = null;
    previewRef.current?.remove();
    previewRef.current = null;
    const layerEl = layerRef.current;
    if (layerEl?.matches(':popover-open')) {
      layerEl.hidePopover();
    }
  }, []);

  useEffect(
    () => () => {
      backdropAnimatorRef.current?.dispose();
      backdropAnimatorRef.current = null;
      cleanUp();
    },
    [cleanUp],
  );

  const lift = useCallback((): ContextMenuLiftResult | null => {
    const trigger = triggerRef.current;
    const layerEl = layerRef.current;
    const backdrop = backdropRef.current;
    if (
      trigger == null ||
      layerEl == null ||
      backdrop == null ||
      typeof layerEl.showPopover !== 'function'
    ) {
      return null;
    }
    generationRef.current += 1;
    cleanUp();
    // The view as laid out (any scale on it is the press feedback's, about
    // its center, which the lifted preview takes over from).
    const rect = trigger.getBoundingClientRect();
    const width = trigger.offsetWidth || rect.width;
    const height = trigger.offsetHeight || rect.height;
    // The press feedback's scale on the trigger, which the copy grows on from.
    const pressScale = width > 0 ? rect.width / width : 1;
    const source: LiftBox = {
      x: rect.left + (rect.width - width) / 2,
      y: rect.top + (rect.height - height) / 2,
      width,
      height,
    };
    const viewport = viewportOf(trigger.ownerDocument);
    const lifted = liftedBox(source, viewport);
    const preview = clonePreview(trigger);
    Object.assign(preview.style, {
      position: 'fixed',
      left: `${source.x}px`,
      top: `${source.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      margin: '0',
      boxSizing: 'border-box',
      transformOrigin: '0 0',
      opacity: '1',
      isolation: 'isolate',
    });
    const shadow = trigger.ownerDocument.createElement('span');
    shadow.className = stylex.props(styles.shadow).className ?? '';
    shadow.style.borderRadius = shapeRadius(trigger);
    shadow.setAttribute('data-astryx-context-menu-shadow', '');
    preview.prepend(shadow);
    preview.style.removeProperty('scale');
    preview.style.removeProperty('translate');
    layerEl.append(preview);
    previewRef.current = preview;
    const previewAnimator = createAnimator(preview);
    previewAnimatorRef.current = previewAnimator;
    const reduced = prefersReducedMotion();
    // The copy starts where the press left the trigger (scaled about its
    // center) and grows on to its lifted box.
    previewAnimator.set({
      x: (width * (1 - pressScale)) / 2,
      y: (height * (1 - pressScale)) / 2,
      scale: pressScale,
    });
    const liftScale = lifted.width / width;
    previewAnimator.animate(
      {x: lifted.x - source.x, y: lifted.y - source.y, scale: liftScale},
      {spring: reduced ? springs.menuReducedMotion : springs.contextMenuLift},
      {reducedMotion: 'keep'},
    );
    const shadowAnimator = createAnimator(shadow, {initial: {opacity: 0}});
    shadowAnimatorRef.current = shadowAnimator;
    shadowAnimator.animate(
      {opacity: 1},
      {spring: reduced ? springs.menuReducedMotion : LIFT.morphSpring},
      {reducedMotion: 'keep'},
    );
    layerEl.showPopover();
    let backdropAnimator = backdropAnimatorRef.current;
    if (backdropAnimator?.element !== backdrop) {
      backdropAnimator?.dispose();
      backdropAnimator = createAnimator(backdrop, {initial: {opacity: 0}});
      backdropAnimatorRef.current = backdropAnimator;
    }
    // The backdrop fades in on the lift's spring, Reduced Motion or not.
    backdropAnimator.animate(
      {opacity: 1},
      {spring: springs.contextMenuLift},
      {reducedMotion: 'keep'},
    );
    return {source, lifted, viewport};
  }, [cleanUp, triggerRef]);

  const drop = useCallback(() => {
    const previewAnimator = previewAnimatorRef.current;
    const backdropAnimator = backdropAnimatorRef.current;
    if (previewAnimator == null) {
      cleanUp();
      return;
    }
    const generation = generationRef.current;
    const spring = prefersReducedMotion()
      ? springs.menuReducedMotion
      : springs.contextMenuDismiss;
    backdropAnimator?.animate({opacity: 0}, {spring}, {reducedMotion: 'keep'});
    shadowAnimatorRef.current?.animate(
      {opacity: 0},
      {spring},
      {reducedMotion: 'keep'},
    );
    const {finished} = previewAnimator.animate(
      {x: 0, y: 0, scale: 1},
      {spring},
      {reducedMotion: 'keep'},
    );
    void finished.then(() => {
      if (generationRef.current === generation) {
        cleanUp();
      }
    });
  }, [cleanUp]);

  const layer = (
    <span
      ref={layerRef}
      popover="manual"
      aria-hidden="true"
      data-astryx-context-menu-lift=""
      {...stylex.props(styles.layer)}>
      <span
        ref={backdropRef}
        onPointerDown={event => {
          backdropPointerRef.current = event.isPrimary ? event.pointerId : null;
        }}
        onPointerUp={event => {
          const wentDownHere = backdropPointerRef.current === event.pointerId;
          backdropPointerRef.current = null;
          if (wentDownHere) {
            onBackdropTapRef.current?.();
          }
        }}
        onPointerCancel={() => {
          backdropPointerRef.current = null;
        }}
        {...stylex.props(styles.backdrop)}
      />
    </span>
  );

  return {layer, lift, drop};
}
