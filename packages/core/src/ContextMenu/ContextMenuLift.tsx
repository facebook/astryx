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
 * under the copy. The menu's glass grows out of the finger, the content
 * following it in from a blur (`morphMenu`), and shrinks back into it when
 * the menu closes (`dismissMenu`), from wherever the entrance stands (every
 * part retargets, as UIKit's springs do). When the menu closes, the copy
 * returns to the view's place on the dismissal spring while the backdrop and
 * the shadow clear. A press that lands on the backdrop is the layer's until
 * it lifts: the layer stays up, bare, past the close if need be, so that
 * press never reaches what is under it.
 *
 * Here the copy is a clone of the trigger (inert, hidden from assistive
 * technology, without ids) in a manual popover rendered next to the trigger
 * (spans, so prose around an inline trigger stays valid), so the page's
 * theme variables still reach it. A block trigger lifts; an inline one keeps
 * the cursor menu. The tint and the shadow are the theme's
 * (`--color-background-backdrop`, `--shadow-high`): UIKit's own are
 * rgba(0.086, 0.082, 0.165, 0.21) and a black shadow at 0.30, radius 20, no
 * offset, shaped by the view's pixels. Position, scale and opacity move on
 * the compositor animator; the menu's content (its clip and blur) plays as
 * keyframes sampled from the same springs.
 * Nothing renders during the motion.
 *
 * SYNC: When modified, update /packages/core/src/ContextMenu/ContextMenu.tsx
 * and /packages/core/src/ContextMenu/__tests__/ContextMenuLift.interaction.browser.spec.ts
 */

import * as stylex from '@stylexjs/stylex';
import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {createAnimator, type Animator} from '../motion/animator';
import {contextMenu, springs} from '../motion/uikit';
import {colorVars, shadowVars} from '../theme/tokens.stylex';
import {
  liftedBox,
  menuExit,
  menuMorph,
  type LiftBox,
  type LiftViewport,
  type MenuMorphState,
} from './contextMenuLiftGeometry';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';

const LIFT = contextMenu.lift;
/**
 * How long the layer waits, once the last pointer that went down on it has
 * lifted, for that touch's click before it hides anyway (a long press sends
 * none).
 */
const CLICK_AFTER_LIFT_MS = 350;
/** One frame at 60 Hz, ms: the exit starts in the frame after the close. */
const FRAME_MS = 1000 / 60;

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
  /**
   * The menu's entrance beside the copy: its glass grows out of `press`
   * (client px) into `menu`'s frame, and its content, clipped to the glass,
   * follows it in from a blur (`menuMorph`).
   */
  morphMenu(menu: HTMLElement, press: {x: number; y: number}): void;
  /**
   * The menu is closing: a copy of it shrinks back into the finger, its glass
   * fading, before the menu itself hides (`menuExit`). Call it while the menu
   * still shows; a no-op when nothing is lifted.
   */
  dismissMenu(menu: HTMLElement): void;
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
 * WAAPI keyframes sampled at 60 Hz over `seconds`: `frame(t)` builds the
 * keyframe `t` seconds in.
 */
function sampleKeyframes(
  seconds: number,
  frame: (t: number) => Keyframe,
): {keyframes: Keyframe[]; duration: number} {
  const length = Math.max(seconds, 1 / 60);
  const steps = Math.max(2, Math.ceil(length * 60));
  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    keyframes.push({...frame((i / steps) * length), offset: i / steps});
  }
  return {keyframes, duration: length * 1000};
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
  // Every pointer that went down on the backdrop and is still down. While
  // one is, the layer stays up (bare once the exit is over), so a press that
  // began on the fading dim never lands on what is under it: UIKit keeps a
  // touch on the view it began on.
  const backdropPointersRef = useRef(new Set<number>());
  const isHidePendingRef = useRef(false);
  const layerRef = useRef<HTMLSpanElement>(null);
  const backdropRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const previewAnimatorRef = useRef<Animator | null>(null);
  const backdropAnimatorRef = useRef<Animator | null>(null);
  const shadowAnimatorRef = useRef<Animator | null>(null);
  // The press point the menu grew out of, which it shrinks back into.
  const pressRef = useRef<{x: number; y: number} | null>(null);
  const exitRef = useRef<{
    glass: HTMLElement;
    glassAnimator: Animator;
    content: HTMLElement;
    /** Created in the frame after the close (null until then). */
    animation: Animation | null;
    /** The frame that starts the exit, until it runs. */
    frame: number | null;
    /** When the exit is over, `performance.now()` ms. */
    endsAt: number;
  } | null>(null);
  const morphRef = useRef<{
    menu: HTMLElement;
    glass: HTMLElement;
    glassAnimator: Animator;
    animation: Animation;
  } | null>(null);
  // Bumps on every lift, so a drop that finishes late leaves a newer lift be.
  const generationRef = useRef(0);

  const endMorph = useCallback(() => {
    const morph = morphRef.current;
    if (morph == null) {
      return;
    }
    morphRef.current = null;
    morph.animation.cancel();
    morph.glassAnimator.dispose();
    morph.glass.remove();
    for (const property of ['background-color', 'box-shadow', 'overflow']) {
      morph.menu.style.removeProperty(property);
    }
  }, []);

  const endExit = useCallback(() => {
    const exit = exitRef.current;
    if (exit == null) {
      return;
    }
    exitRef.current = null;
    if (exit.frame != null) {
      cancelAnimationFrame(exit.frame);
    }
    exit.animation?.cancel();
    exit.glassAnimator.dispose();
    exit.glass.remove();
    exit.content.remove();
  }, []);

  const hideLayer = useCallback(() => {
    if (backdropPointersRef.current.size > 0) {
      isHidePendingRef.current = true;
      return;
    }
    isHidePendingRef.current = false;
    const layerEl = layerRef.current;
    if (layerEl?.matches(':popover-open')) {
      layerEl.hidePopover();
    }
  }, []);

  // The last pointer that went down on the backdrop lifted: a hide that
  // waited for it happens once that touch's click (which comes after the
  // pointer's up) has landed on the layer too, or shortly after.
  const releaseBackdropPointer = useCallback(
    (pointerId: number) => {
      const pointers = backdropPointersRef.current;
      pointers.delete(pointerId);
      const layerEl = layerRef.current;
      if (pointers.size > 0 || !isHidePendingRef.current || layerEl == null) {
        return;
      }
      const finish = () => {
        layerEl.removeEventListener('click', finish, true);
        clearTimeout(timer);
        if (isHidePendingRef.current && pointers.size === 0) {
          hideLayer();
        }
      };
      layerEl.addEventListener('click', finish, true);
      const timer = setTimeout(finish, CLICK_AFTER_LIFT_MS);
    },
    [hideLayer],
  );

  const cleanUp = useCallback(() => {
    endMorph();
    endExit();
    shadowAnimatorRef.current?.dispose();
    shadowAnimatorRef.current = null;
    previewAnimatorRef.current?.dispose();
    previewAnimatorRef.current = null;
    previewRef.current?.remove();
    previewRef.current = null;
    hideLayer();
  }, [endMorph, endExit, hideLayer]);

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
    endMorph();
    const previewAnimator = previewAnimatorRef.current;
    const backdropAnimator = backdropAnimatorRef.current;
    if (previewAnimator == null) {
      cleanUp();
      return;
    }
    const generation = generationRef.current;
    const reduced = prefersReducedMotion();
    // As measured: the backdrop clears on the dismissal spring, the copy
    // returns on the morph spring and its shadow fades on its own.
    backdropAnimator?.animate(
      {opacity: 0},
      {
        spring: reduced
          ? springs.menuReducedMotion
          : springs.contextMenuDismiss,
      },
      {reducedMotion: 'keep'},
    );
    shadowAnimatorRef.current?.animate(
      {opacity: 0},
      {spring: reduced ? springs.menuReducedMotion : LIFT.shadowExitSpring},
      {reducedMotion: 'keep'},
    );
    const {finished} = previewAnimator.animate(
      {x: 0, y: 0, scale: 1},
      {spring: reduced ? springs.menuReducedMotion : LIFT.morphSpring},
      {reducedMotion: 'keep'},
    );
    // The layer hides once the copy is back and the menu's exit is done (on
    // a timer: an animation's `finished` can stall in some engines, e.g.
    // WebKit right after a filter animation is cancelled).
    const exit = exitRef.current;
    const exitDone =
      exit == null
        ? undefined
        : new Promise<void>(resolve => {
            setTimeout(resolve, Math.max(exit.endsAt - performance.now(), 0));
          });
    void Promise.all([finished, exitDone]).then(() => {
      if (generationRef.current === generation) {
        cleanUp();
      }
    });
  }, [cleanUp, endMorph]);

  const morphMenu = useCallback(
    (menu: HTMLElement, press: {x: number; y: number}) => {
      endMorph();
      pressRef.current = {x: press.x, y: press.y};
      const layerEl = layerRef.current;
      if (layerEl == null || typeof menu.animate !== 'function') {
        return;
      }
      const rect = menu.getBoundingClientRect();
      const box: LiftBox = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
      if (box.width <= 0 || box.height <= 0) {
        return;
      }
      const style = getComputedStyle(menu);
      const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
      const reduced = prefersReducedMotion();
      const morph = menuMorph(box, press, {reduced});
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      // The glass: a blob in the lift layer wearing the menu's own background,
      // radius and shadow, scaled on the compositor from the press point and
      // fading in on the content's progress.
      const glass = menu.ownerDocument.createElement('span');
      glass.setAttribute('data-astryx-context-menu-glass', '');
      Object.assign(glass.style, {
        position: 'fixed',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        pointerEvents: 'none',
      });
      layerEl.append(glass);
      const start = morph.at(0);
      const at = glass.ownerDocument.timeline?.currentTime;
      const startAt = typeof at === 'number' ? at : performance.now();
      const glassAnimator = createAnimator(glass);
      // The glass fades in with the content: UIKit's blob starts as the view
      // under the finger (a copy of it) and cross-fades into the menu.
      glassAnimator.set({
        x: start.centerX - centerX,
        y: start.centerY - centerY,
        scaleX: start.width / box.width,
        scaleY: start.height / box.height,
        opacity: 0,
      });
      glassAnimator.animate(
        {x: 0, y: 0, opacity: 1},
        {spring: reduced ? springs.menuReducedMotion : LIFT.morphSpring},
        {reducedMotion: 'keep', at: startAt},
      );
      glassAnimator.animate(
        {scaleX: 1, scaleY: 1},
        {spring: reduced ? springs.menuReducedMotion : LIFT.morphSizeSpring},
        {reducedMotion: 'keep', at: startAt + LIFT.morphSizeDelayMs},
      );
      // The menu itself goes bare (the blob is its glass) and unclipped by its
      // own scroll box; its content follows the blob's centre, scaled, faded in
      // from a blur and clipped to the blob.
      menu.style.backgroundColor = 'transparent';
      menu.style.boxShadow = 'none';
      menu.style.overflow = 'visible';
      const blur = LIFT.menuEntranceBlur;
      const {keyframes, duration} = sampleKeyframes(morph.duration, t => {
        const m = morph.at(t);
        const scale = m.contentScale;
        const insetX = box.width / 2 - m.width / (2 * scale);
        const insetY = box.height / 2 - m.height / (2 * scale);
        const radiusX = (radius * m.width) / box.width / scale;
        const radiusY = (radius * m.height) / box.height / scale;
        return {
          transform: `translate(${(m.centerX - centerX).toFixed(3)}px, ${(m.centerY - centerY).toFixed(3)}px) scale(${scale.toFixed(5)})`,
          clipPath: `inset(${insetY.toFixed(3)}px ${insetX.toFixed(3)}px round ${radiusX.toFixed(3)}px / ${radiusY.toFixed(3)}px)`,
          opacity: String(Math.min(Math.max(m.fade, 0), 1)),
          filter: `blur(${(blur * Math.max(1 - m.fade, 0)).toFixed(3)}px)`,
        };
      });
      const animation = menu.animate(keyframes, {duration});
      const entry = {menu, glass, glassAnimator, animation};
      morphRef.current = entry;
      // It ends when the entrance does, by its promise or (should the engine
      // stall it) by the clock.
      const end = () => {
        if (morphRef.current === entry) {
          endMorph();
        }
      };
      animation.finished.then(end, () => {});
      setTimeout(end, duration + 50);
    },
    [endMorph],
  );

  const dismissMenu = useCallback(
    (menu: HTMLElement) => {
      const layerEl = layerRef.current;
      const preview = previewRef.current;
      if (
        layerEl == null ||
        preview == null ||
        typeof menu.animate !== 'function'
      ) {
        return;
      }
      // A close during the entrance retargets from where it stands, as
      // UIKit's springs do: the glass's box and opacity, and the content's
      // scale and fade, before the entrance ends.
      const entrance = morphRef.current;
      let from: MenuMorphState | undefined;
      let glassOpacity = 1;
      if (entrance != null) {
        const glassBox = entrance.glass.getBoundingClientRect();
        const contentStyle = getComputedStyle(menu);
        from = {
          centerX: glassBox.left + glassBox.width / 2,
          centerY: glassBox.top + glassBox.height / 2,
          width: glassBox.width,
          height: glassBox.height,
          contentScale:
            contentStyle.transform === 'none'
              ? 1
              : new DOMMatrixReadOnly(contentStyle.transform).a,
          fade: Number.parseFloat(contentStyle.opacity) || 0,
        };
        glassOpacity =
          Number.parseFloat(getComputedStyle(entrance.glass).opacity) || 0;
      }
      // The menu's own frame (its entrance ends here).
      endMorph();
      endExit();
      const rect = menu.getBoundingClientRect();
      const box: LiftBox = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
      if (box.width <= 0 || box.height <= 0) {
        return;
      }
      const copy = preview.getBoundingClientRect();
      const press = pressRef.current ?? {
        x: copy.left + copy.width / 2,
        y: copy.top + copy.height / 2,
      };
      const style = getComputedStyle(menu);
      const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
      const reduced = prefersReducedMotion();
      const exit = menuExit(box, press, {reduced, from});
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const doc = menu.ownerDocument;
      // The glass shrinks back into the finger, fading as UIKit's menu view
      // does.
      const glass = doc.createElement('span');
      glass.setAttribute('data-astryx-context-menu-glass', 'exit');
      Object.assign(glass.style, {
        position: 'fixed',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        pointerEvents: 'none',
      });
      // A copy of the menu's content (inert, unnamed), on a bare surface.
      const content = menu.cloneNode(true) as HTMLElement;
      for (const el of [
        content,
        ...content.querySelectorAll<HTMLElement>('[id]'),
      ]) {
        el.removeAttribute('id');
      }
      content.setAttribute('aria-hidden', 'true');
      content.setAttribute('data-astryx-context-menu-exit', '');
      content.inert = true;
      Object.assign(content.style, {
        position: 'fixed',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        margin: '0',
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        pointerEvents: 'none',
      });
      layerEl.append(glass, content);
      const glassAnimator = createAnimator(glass);
      if (from != null) {
        glassAnimator.set({
          x: from.centerX - centerX,
          y: from.centerY - centerY,
          scaleX: from.width / box.width,
          scaleY: from.height / box.height,
          opacity: glassOpacity,
        });
      }
      const {exitEnd, exitWidthSpring, exitHeightSpring, morphSpring} = LIFT;
      const spring = (description: SpringDescription) =>
        reduced ? springs.menuReducedMotion : description;
      // The content follows the glass's centre, clipped to it, shrinking and
      // blurring out as it fades (with the menu view's own fade on top).
      const fadeOut = solveSpring(
        toSpring(
          reduced ? springs.menuReducedMotion : springs.contextMenuDismiss,
        ),
        {from: 1, to: 0},
      );
      const blur = LIFT.menuEntranceBlur;
      const {keyframes, duration} = sampleKeyframes(exit.duration, t => {
        const m = exit.at(t);
        const scale = m.contentScale;
        const insetX = box.width / 2 - m.width / (2 * scale);
        const insetY = box.height / 2 - m.height / (2 * scale);
        const radiusX = (radius * m.width) / box.width / scale;
        const radiusY = (radius * m.height) / box.height / scale;
        const opacity = Math.min(Math.max(m.fade * fadeOut.value(t), 0), 1);
        return {
          transform: `translate(${(m.centerX - centerX).toFixed(3)}px, ${(m.centerY - centerY).toFixed(3)}px) scale(${scale.toFixed(5)})`,
          clipPath: `inset(${insetY.toFixed(3)}px ${insetX.toFixed(3)}px round ${radiusX.toFixed(3)}px / ${radiusY.toFixed(3)}px)`,
          opacity: String(opacity),
          filter: `blur(${(blur * Math.max(1 - m.fade, 0)).toFixed(3)}px)`,
        };
      });
      // The content holds where the exit starts until its first frame.
      const [first] = keyframes;
      Object.assign(content.style, {
        transform: String(first.transform),
        clipPath: String(first.clipPath),
        opacity: String(first.opacity),
        filter: String(first.filter),
      });
      const entry: NonNullable<typeof exitRef.current> = {
        glass,
        glassAnimator,
        content,
        animation: null,
        frame: null,
        endsAt: performance.now() + duration + FRAME_MS,
      };
      exitRef.current = entry;
      // Every part starts together in the next frame (the animator's
      // next-frame creation): the close's own commit runs first, so WebKit
      // neither dates the composited glass and content transforms before it
      // nor lets the content's clip, painted on the main thread, trail them
      // out of the glass.
      entry.frame = requestAnimationFrame(() => {
        entry.frame = null;
        if (exitRef.current !== entry) {
          return;
        }
        glassAnimator.animate(
          {x: press.x - centerX, y: press.y - centerY},
          {spring: spring(morphSpring)},
          {reducedMotion: 'keep'},
        );
        glassAnimator.animate(
          {scaleX: exitEnd.width / box.width},
          {spring: spring(exitWidthSpring)},
          {reducedMotion: 'keep'},
        );
        glassAnimator.animate(
          {scaleY: exitEnd.height / box.height},
          {spring: spring(exitHeightSpring)},
          {reducedMotion: 'keep'},
        );
        glassAnimator.animate(
          {opacity: 0},
          {
            spring: reduced
              ? springs.menuReducedMotion
              : springs.contextMenuDismiss,
          },
          {reducedMotion: 'keep'},
        );
        entry.animation = content.animate(keyframes, {
          duration,
          fill: 'forwards',
        });
        entry.endsAt = performance.now() + duration;
      });
    },
    [endExit, endMorph],
  );

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
          backdropPointersRef.current.add(event.pointerId);
          backdropPointerRef.current = event.isPrimary ? event.pointerId : null;
        }}
        onPointerUp={event => {
          const wentDownHere = backdropPointerRef.current === event.pointerId;
          backdropPointerRef.current = null;
          if (wentDownHere) {
            onBackdropTapRef.current?.();
          }
          releaseBackdropPointer(event.pointerId);
        }}
        onPointerCancel={event => {
          backdropPointerRef.current = null;
          releaseBackdropPointer(event.pointerId);
        }}
        {...stylex.props(styles.backdrop)}
      />
    </span>
  );

  return {layer, lift, morphMenu, dismissMenu, drop};
}
