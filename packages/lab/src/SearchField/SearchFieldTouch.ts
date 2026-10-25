// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SearchFieldTouch.ts
 * @input The animator (`@astryxdesign/core/motion/useAnimator`), the
 *   search table and its roles' registration
 *   (`@astryxdesign/core/motion/uikit`), the touch resolver
 *   (`@astryxdesign/core/utils/touchPresentation`), the tap recognizer
 *   (`@astryxdesign/core/gestures`) and searchFieldModel.ts
 * @output useSearchFieldMotion: SearchField's touch layer. It places the
 *   field's parts and, under a finger, plays UIKit's activation and cancel
 *   (stacked: one clock; bottom: the measured gel) from the frame that
 *   presents them at rest, a change of mind adding to the curves on screen.
 *   A bottom field keeps above the software keyboard by layout, committed
 *   on each keyboard report with no ride. Where the keyboard covers the
 *   page, a tap on a bottom field's text is claimed, so Safari does not pan
 *   the page. Under a mouse or a trackpad the parts take their places at
 *   once
 * @position SearchField's one touch-layer module, imported only by
 *   SearchField.tsx, so a desktop build can swap it and the size report can
 *   measure it
 *
 * SYNC: When modified, update SearchField.tsx and searchFieldModel.ts.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  TapGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures';
import {isRtlElement} from '@astryxdesign/core/hooks';
import {
  activationTiming,
  bottomEdges,
  bottomLift,
  bottomMotion,
  bottomPoseFor,
  bottomRedirect,
  easedCurve,
  heldCurve,
  poseFor,
  type BottomMotion,
  type BottomPose,
  type SearchFieldGeometry,
  type SearchFieldPose,
} from './searchFieldModel';
import {
  type AnimateOptions,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '@astryxdesign/core/motion/animator';
import {registerSearchTable, search} from '@astryxdesign/core/motion/uikit';
import {useAnimator} from '@astryxdesign/core/motion/useAnimator';
import {useTouchPresentation} from '@astryxdesign/core/utils/touchPresentation';

const {bottom} = search;

/** Where the field lives (SearchField's `placement`). */
export type SearchFieldPlacement = 'stacked' | 'bottom';

/** The refs SearchField puts on the parts the touch layer moves. */
export interface SearchFieldMotion {
  rootRef: (element: HTMLElement | null) => void;
  startRef: (element: HTMLElement | null) => void;
  contentRef: (element: HTMLElement | null) => void;
  middleRef: (element: HTMLElement | null) => void;
  endRef: (element: HTMLElement | null) => void;
  endCapRef: (element: HTMLElement | null) => void;
  closeRef: (element: HTMLElement | null) => void;
  /**
   * How far a bottom field sits above its resting place for the software
   * keyboard, px: layout, applied as the root's `bottom`. 0 elsewhere.
   */
  keyboardLift: number;
}

/**
 * SearchField's touch layer: the parts' poses, and UIKit's activation under
 * a finger (a coarse primary pointer, on every touch device). Reduced motion
 * is the animator's: under a finger it turns the travel into a cross-fade
 * (`design:reduced-motion` DR2).
 */
export function useSearchFieldMotion({
  fieldRef,
  inputRef,
  isActive,
  lift,
  placement,
}: {
  fieldRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  isActive: boolean;
  lift: number;
  placement: SearchFieldPlacement;
}): SearchFieldMotion {
  const rootAnimator = useAnimator();
  const startAnimator = useAnimator();
  const contentAnimator = useAnimator();
  const middleAnimator = useAnimator();
  const endAnimator = useAnimator();
  const endCapAnimator = useAnimator();
  const closeAnimator = useAnimator();
  const {isTouch} = useTouchPresentation();
  const isBottom = placement === 'bottom';
  const isStacked = placement === 'stacked';

  // ---------------------------------------------------------------------------
  // Stacked: UIKit's activation on one clock
  // ---------------------------------------------------------------------------

  const fieldHeight = isBottom
    ? bottom.fieldHeight
    : search.stacked.fieldHeight;
  const geometry = useCallback((): SearchFieldGeometry => {
    const field = fieldRef.current;
    return {
      restWidth: field?.getBoundingClientRect().width ?? 0,
      height: fieldHeight,
      lift,
      isRtl: isRtlElement(field),
    };
  }, [fieldRef, fieldHeight, lift]);

  const presented = useCallback(
    (): SearchFieldPose => ({
      y: rootAnimator.animator.get('y'),
      middleScale: middleAnimator.animator.get('scaleX'),
      endX: endAnimator.animator.get('x'),
      closeX: closeAnimator.animator.get('x'),
      closeOpacity: closeAnimator.animator.get('opacity'),
    }),
    [rootAnimator, middleAnimator, endAnimator, closeAnimator],
  );

  const place = useCallback(
    (pose: SearchFieldPose) => {
      rootAnimator.animator.set({y: pose.y});
      middleAnimator.animator.set({scaleX: pose.middleScale});
      endAnimator.animator.set({x: pose.endX});
      closeAnimator.animator.set({x: pose.closeX, opacity: pose.closeOpacity});
    },
    [rootAnimator, middleAnimator, endAnimator, closeAnimator],
  );

  // The state the parts last settled toward (null before the first
  // layout), and whether a move is still playing.
  const settledRef = useRef<boolean | null>(null);
  const isAnimating = useRef(false);
  useLayoutEffect(() => {
    if (!isStacked) {
      return;
    }
    const target = isActive;
    if (settledRef.current === null || !isTouch) {
      // First layout, or a mouse or trackpad: take the places at once.
      settledRef.current = target;
      place(poseFor(target, geometry()));
      // The parts now hold their places: the CSS form of the active pose
      // (for a server render) steps aside in the same task.
      rootAnimator.animator.element?.setAttribute(
        'data-search-field-placed',
        '',
      );
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      place(poseFor(target, geometry()));
      return;
    }
    settledRef.current = target;
    const continuesMotion = isAnimating.current;
    isAnimating.current = true;
    let cancelled = false;
    const shape = geometry();
    const to = poseFor(target, shape);
    const current = presented();
    // The clock and curve under the field's theme, read as the move starts
    // (the search table's roles, registered once before the first move).
    registerSearchTable();
    const timing = activationTiming(rootAnimator.animator.element);
    const duration = timing.seconds;
    // From rest the move waits for the frame that presents the parts at rest
    // (`start: 'presented'`): Mobile Safari brings the keyboard up with no
    // frame for ~150 ms after the focus, and a motion created before that
    // stall would jump a third of the way when frames resume. A host that
    // moves with the field (a navigation bar) starts the same way, in the
    // same task, so both start together. A change of mind mid-move adds the
    // turn to the curve on screen (`additive`), as UIKit's animations do: the
    // old curve carries the rest of its travel, the added one runs the whole
    // clock, and the turn keeps its velocity however late WebKit applies it.
    // Under reduced motion the animator plays its cross-fade for these.
    const options = continuesMotion
      ? {additive: true}
      : {start: 'presented' as const};
    const handles = [
      play(
        rootAnimator.animator,
        {y: easedCurve(current.y, to.y, duration, timing.ease)},
        options,
      ),
      play(
        middleAnimator.animator,
        {
          scaleX: easedCurve(
            current.middleScale,
            to.middleScale,
            duration,
            timing.ease,
          ),
        },
        options,
      ),
      play(
        endAnimator.animator,
        {x: easedCurve(current.endX, to.endX, duration, timing.ease)},
        options,
      ),
      play(
        closeAnimator.animator,
        {
          x: easedCurve(current.closeX, to.closeX, duration, timing.ease),
          // Cancel slides the close button out at the opacity it has and
          // removes it at the end, as UIKit does.
          opacity: target
            ? easedCurve(
                current.closeOpacity,
                to.closeOpacity,
                duration,
                timing.ease,
              )
            : heldCurve(current.closeOpacity, to.closeOpacity, duration),
        },
        options,
      ),
    ];
    const playing = handles.filter(
      (handle): handle is MotionHandle => handle != null,
    );
    void Promise.all(playing.map(handle => handle.finished)).then(results => {
      if (cancelled || !results.every(Boolean)) {
        return;
      }
      isAnimating.current = false;
    });
    return () => {
      cancelled = true;
    };
    // `geometry` changes with `lift`; a lift change while settled re-places
    // the field through the same path.
  }, [
    isStacked,
    isActive,
    isTouch,
    geometry,
    place,
    presented,
    rootAnimator,
    middleAnimator,
    endAnimator,
    closeAnimator,
  ]);

  // ---------------------------------------------------------------------------
  // Bottom: the measured gel
  // ---------------------------------------------------------------------------

  const bottomShape = useCallback(() => {
    const root = rootAnimator.animator.element;
    return {width: root?.clientWidth ?? 0, isRtl: isRtlElement(root)};
  }, [rootAnimator]);

  const placeBottom = useCallback(
    (pose: BottomPose) => {
      const {width, isRtl} = bottomShape();
      const parts = bottomParts(pose, width, isRtl, fieldHeight);
      const direction = isRtl ? -1 : 1;
      startAnimator.animator.set({x: parts.shift, scaleY: parts.heightScale});
      contentAnimator.animator.set({x: parts.shift});
      middleAnimator.animator.set({
        x: parts.shift,
        scaleX: parts.middleScale,
        scaleY: parts.heightScale,
      });
      endAnimator.animator.set({x: parts.endX});
      endCapAnimator.animator.set({scaleY: parts.heightScale});
      closeAnimator.animator.set({
        x: direction * pose.closeX,
        scale: pose.closeScale,
        opacity: pose.closeOpacity,
      });
    },
    [
      bottomShape,
      fieldHeight,
      startAnimator,
      contentAnimator,
      middleAnimator,
      endAnimator,
      endCapAnimator,
      closeAnimator,
    ],
  );

  // Where the bottom field shows now, read off its parts.
  const presentedBottom = useCallback((): BottomPose => {
    const {width, isRtl} = bottomShape();
    const edges = bottomEdges(width);
    const direction = isRtl ? -1 : 1;
    return {
      leading: edges.restLeading + direction * startAnimator.animator.get('x'),
      trailing: edges.restTrailing + direction * endAnimator.animator.get('x'),
      heightScale: endCapAnimator.animator.get('scaleY'),
      closeX: direction * closeAnimator.animator.get('x'),
      closeScale: closeAnimator.animator.get('scale'),
      closeOpacity: closeAnimator.animator.get('opacity'),
    };
  }, [bottomShape, startAnimator, endAnimator, endCapAnimator, closeAnimator]);

  useLayoutEffect(() => {
    if (!isBottom) {
      return;
    }
    const target = isActive;
    const {width, isRtl} = bottomShape();
    if (settledRef.current === null || !isTouch) {
      // First layout, or a mouse or trackpad: take the places at once.
      settledRef.current = target;
      placeBottom(bottomPoseFor(target, width));
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      placeBottom(bottomPoseFor(target, width));
      return;
    }
    settledRef.current = target;
    // The search table's roles (the activation's clock and curve, for a
    // change of mind), registered once before the first move.
    registerSearchTable();
    // iOS changes the field's frame each frame with no animation object:
    // play the measured frames, every part on one clock, from the frame that
    // presents the field at rest (as the stacked field starts). A change of
    // mind mid-move adds an eased turn from where the field shows to the
    // curves on screen, on the activation's whole clock, as UIKit's
    // animations do.
    const continuesMotion = isAnimating.current;
    const motion = continuesMotion
      ? (() => {
          const timing = activationTiming(rootAnimator.animator.element);
          return bottomRedirect(
            presentedBottom(),
            target,
            width,
            timing.seconds,
            timing.ease,
          );
        })()
      : bottomMotion(target, width);
    const direction = isRtl ? -1 : 1;
    const part = (pick: (parts: BottomParts) => number) =>
      derivedCurve(motion, pick, width, isRtl, fieldHeight);
    const options = continuesMotion
      ? {additive: true}
      : {start: 'presented' as const};
    isAnimating.current = true;
    const handles = [
      play(
        startAnimator.animator,
        {x: part(p => p.shift), scaleY: part(p => p.heightScale)},
        options,
      ),
      play(contentAnimator.animator, {x: part(p => p.shift)}, options),
      play(
        middleAnimator.animator,
        {
          x: part(p => p.shift),
          scaleX: part(p => p.middleScale),
          scaleY: part(p => p.heightScale),
        },
        options,
      ),
      play(endAnimator.animator, {x: part(p => p.endX)}, options),
      play(
        endCapAnimator.animator,
        {scaleY: part(p => p.heightScale)},
        options,
      ),
      play(
        closeAnimator.animator,
        {
          x: scaled(motion.closeX, direction),
          scale: motion.closeScale,
          opacity: motion.closeOpacity,
        },
        options,
      ),
    ];
    let cancelled = false;
    const playing = handles.filter(
      (handle): handle is MotionHandle => handle != null,
    );
    void Promise.all(playing.map(handle => handle.finished)).then(results => {
      if (cancelled || !results.every(Boolean)) {
        return;
      }
      isAnimating.current = false;
    });
    return () => {
      cancelled = true;
    };
  }, [
    isBottom,
    isActive,
    isTouch,
    bottomShape,
    placeBottom,
    presentedBottom,
    fieldHeight,
    rootAnimator,
    startAnimator,
    contentAnimator,
    middleAnimator,
    endAnimator,
    endCapAnimator,
    closeAnimator,
  ]);

  // ---------------------------------------------------------------------------
  // Bottom: above the software keyboard
  // ---------------------------------------------------------------------------

  // The keyboard's height as of its last report, and how far the field's
  // resting centre sits above the viewport's bottom edge. The root's
  // `bottom` (SearchField.tsx) takes the lift at once on each report: a Lab
  // surface commits the resting value and never rides the keyboard
  // (spec:AST-099 FR8, react-component-runtime INV11), under reduced motion
  // too.
  const isLifted = isBottom && isTouch;
  const {height: keyboardHeight, restGap} = useKeyboardHeight(
    isLifted,
    rootAnimator.animator,
    inputRef,
  );
  const keyboardLift = isLifted
    ? bottomLift(isActive, keyboardHeight, restGap)
    : 0;

  // ---------------------------------------------------------------------------
  // Bottom: a claimed tap on the text
  // ---------------------------------------------------------------------------

  // A tap on the text of a field at the bottom of the screen focuses it
  // without Safari's reveal (`preventScroll`): Safari would otherwise pan
  // the whole page up to show a field the keyboard is about to cover
  // (spec:AST-099 FR4). The tap is the gesture system's: recognizing it
  // cancels the browser's own focus for that touch. Taps on the buttons, and
  // taps once the text has focus, stay the browser's. Only where the
  // keyboard covers the page (Mobile Safari, FR2): where the browser reports
  // the keyboard itself (Chrome on Android, FR8), only its own tap brings
  // the keyboard up (a focus from script inside the tap does not, measured
  // on the Android emulator), and as the keyboard overlays the page from
  // the focus on, that focus pans nothing, so the tap stays the browser's.
  const claimsTapRef = useRef(false);
  useLayoutEffect(() => {
    const win = rootAnimator.animator.element?.ownerDocument.defaultView;
    claimsTapRef.current = !isStacked && win != null && keyboardCoversPage(win);
  }, [isStacked, rootAnimator]);
  // A tap held a while still gets its mouse events a few ms after its
  // cancelled touchend, aimed at whatever is under the finger by then (the
  // field has moved): the claimed tap swallows them, from its touchend until
  // that click, the next touch, pointer or key, or unmount. A click with no
  // press behind it (`detail` 0, from a key) passes.
  const disarmRef = useRef<(() => void) | null>(null);
  const armSwallow = useCallback((doc: Document) => {
    disarmRef.current?.();
    const swallow = (event: Event) => {
      if (event.type === 'click' && (event as MouseEvent).detail === 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'click') {
        disarm();
      }
    };
    const types = ['mousedown', 'mouseup', 'click'] as const;
    const ends = ['touchstart', 'pointerdown', 'keydown'] as const;
    const disarm = () => {
      for (const type of types) {
        doc.removeEventListener(type, swallow, true);
      }
      for (const type of ends) {
        doc.removeEventListener(type, disarm, true);
      }
      if (disarmRef.current === disarm) {
        disarmRef.current = null;
      }
    };
    for (const type of types) {
      doc.addEventListener(type, swallow, true);
    }
    for (const type of ends) {
      doc.addEventListener(type, disarm, true);
    }
    disarmRef.current = disarm;
  }, []);
  useEffect(() => () => disarmRef.current?.(), []);
  useGestureRecognizer(
    fieldRef,
    () =>
      new TapGestureRecognizer({
        name: 'search-field-bottom-focus',
        allowedPointerTypes: ['touch'],
        shouldReceiveTouch: (_recognizer, touch) => {
          const input = inputRef.current;
          const target = touch.target as Element | null;
          return (
            claimsTapRef.current &&
            input != null &&
            input.ownerDocument.activeElement !== input &&
            !(target?.closest?.('button') != null)
          );
        },
      }),
    tap => {
      const input = inputRef.current;
      if (tap.state !== 'ended' || input == null) {
        return;
      }
      armSwallow(input.ownerDocument);
      input.focus({preventScroll: true});
      // The browser would have put the caret where the finger lifted; the
      // claimed tap cancels its focus, and script focus leaves the caret at
      // the start or where it last was, so place it from the tap.
      const offset = caretOffsetAt(input, tap.location().x);
      if (offset != null) {
        input.setSelectionRange(offset, offset);
      }
    },
  );

  // A resize while settled (the window turning, a host relaying out) moves
  // the narrowed end to the new width at once.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const Observer = field?.ownerDocument.defaultView?.ResizeObserver;
    if (field == null || Observer == null) {
      return;
    }
    const observer = new Observer(() => {
      if (isAnimating.current || settledRef.current === null) {
        return;
      }
      if (isBottom) {
        placeBottom(bottomPoseFor(settledRef.current, bottomShape().width));
      } else {
        place(poseFor(settledRef.current, geometry()));
      }
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [fieldRef, isBottom, geometry, place, placeBottom, bottomShape]);

  return {
    rootRef: rootAnimator.ref,
    startRef: startAnimator.ref,
    contentRef: contentAnimator.ref,
    middleRef: middleAnimator.ref,
    endRef: endAnimator.ref,
    endCapRef: endCapAnimator.ref,
    closeRef: closeAnimator.ref,
    keyboardLift,
  };
}

// =============================================================================
// The keyboard
// =============================================================================

/** The browser's own keyboard report (the VirtualKeyboard API). */
interface VirtualKeyboard extends EventTarget {
  overlaysContent: boolean;
  readonly boundingRect: DOMRectReadOnly;
}

/**
 * The browser's own keyboard report, where it gives one (Chrome on Android,
 * in a secure context: spec:AST-099 FR6, FR8) to a top-level document
 * (FR7).
 */
function virtualKeyboardOf(win: Window): VirtualKeyboard | null {
  if (win !== win.top) {
    return null;
  }
  return (
    (win.navigator as Navigator & {virtualKeyboard?: VirtualKeyboard})
      .virtualKeyboard ?? null
  );
}

/**
 * Whether a software keyboard would cover the page rather than resize it
 * (spec:AST-099 FR2, FR6): a visual viewport, no keyboard report of the
 * browser's own (FR8) and the top-level document (FR7).
 */
function keyboardCoversPage(win: Window): boolean {
  return (
    win.visualViewport != null &&
    !('virtualKeyboard' in win.navigator) &&
    win === win.top
  );
}

/**
 * The software keyboard's height as spec:AST-099 FR2 defines it:
 * `innerHeight − visualViewport.height × scale` where it covers the page;
 * 0 otherwise.
 */
export function keyboardInsetOf(win: Window): number {
  const viewport = win.visualViewport;
  if (viewport == null || !keyboardCoversPage(win)) {
    return 0;
  }
  return Math.max(0, win.innerHeight - viewport.height * (viewport.scale ?? 1));
}

/** Whether focus moving to `target` brings up a keyboard. */
function bringsUpKeyboard(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) {
    return true;
  }
  return (
    target instanceof HTMLInputElement &&
    ![
      'button',
      'checkbox',
      'color',
      'file',
      'hidden',
      'image',
      'radio',
      'range',
      'reset',
      'submit',
    ].includes(target.type)
  );
}

/**
 * The software keyboard's height as of its last report, while `enabled`
 * (spec:AST-099 FR1), with no ride and no prediction (FR8):
 * - where the keyboard covers the page (Mobile Safari, Firefox for
 *   Android), FR2's measurement on each visual-viewport resize;
 * - where the browser reports the keyboard itself (Chrome on Android, FR8),
 *   its report: while the field has focus the keyboard overlays the page
 *   (`overlaysContent`) and each `geometrychange` gives its height; after
 *   the blur the overlay goes back once Chrome reports the keyboard down
 *   (at once when focus moves to another text field), so the app's own
 *   viewport setting holds everywhere else.
 * Also the field's resting gap (its resting centre above the viewport's
 * bottom edge), read once with each report.
 */
function useKeyboardHeight(
  enabled: boolean,
  animator: Animator,
  inputRef: RefObject<HTMLInputElement | null>,
): {height: number; restGap: number} {
  const [state, setState] = useState({height: 0, restGap: 0});
  useEffect(() => {
    const root = animator.element;
    const input = inputRef.current;
    const win = root?.ownerDocument.defaultView;
    if (!enabled || root == null || input == null || win == null) {
      return;
    }
    const restGap = () => {
      const rect = root.getBoundingClientRect();
      // Where layout puts the field without the lift (the root's `bottom`).
      const lift = parseFloat(win.getComputedStyle(root).bottom) || 0;
      return win.innerHeight - (rect.top + lift + rect.height / 2);
    };
    const commit = (height: number) => setState({height, restGap: restGap()});
    const keyboard = virtualKeyboardOf(win);
    if (keyboard != null) {
      // The app's own setting, while the field holds the overlay.
      let appOverlay: boolean | null = null;
      let height = 0;
      const giveBack = () => {
        if (appOverlay != null) {
          keyboard.overlaysContent = appOverlay;
          appOverlay = null;
        }
      };
      const onGeometryChange = () => {
        if (appOverlay == null) {
          return;
        }
        height = keyboard.boundingRect.height;
        if (height <= 0.5 && input.ownerDocument.activeElement !== input) {
          // Down after the field's blur: the overlay goes back.
          giveBack();
        }
        commit(height);
      };
      const onFocus = () => {
        if (appOverlay == null) {
          appOverlay = keyboard.overlaysContent;
          keyboard.overlaysContent = true;
        }
        height = keyboard.boundingRect.height;
        commit(height);
      };
      const onBlur = (event: FocusEvent) => {
        // The keyboard goes down after the blur, and Chrome reports it down
        // once it is: until then the bar keeps its place, so a tap that
        // blurred the field (on the close button) still lands where it
        // began. Focus moving to another text field keeps the keyboard up
        // under the app's own setting.
        if (height > 0.5 && !bringsUpKeyboard(event.relatedTarget)) {
          return;
        }
        giveBack();
        height = 0;
        commit(0);
      };
      keyboard.addEventListener('geometrychange', onGeometryChange);
      input.addEventListener('focus', onFocus);
      input.addEventListener('blur', onBlur);
      if (input.ownerDocument.activeElement === input) {
        onFocus();
      } else {
        commit(0);
      }
      return () => {
        keyboard.removeEventListener('geometrychange', onGeometryChange);
        input.removeEventListener('focus', onFocus);
        input.removeEventListener('blur', onBlur);
        giveBack();
      };
    }
    const viewport = win.visualViewport;
    const onResize = () => commit(keyboardInsetOf(win));
    onResize();
    viewport?.addEventListener('resize', onResize);
    win.addEventListener('resize', onResize);
    return () => {
      viewport?.removeEventListener('resize', onResize);
      win.removeEventListener('resize', onResize);
    };
  }, [enabled, animator, inputRef]);
  return enabled ? state : {height: 0, restGap: 0};
}

// =============================================================================
// Helpers
// =============================================================================

/** The bottom field's part values for one frame. */
interface BottomParts {
  /** The leading edge's move from rest, px (the start cap, text, middle). */
  shift: number;
  /** The stretchable middle's width as a fraction of its resting width. */
  middleScale: number;
  /** The trailing end's move from rest, px. */
  endX: number;
  /** The background's height as a fraction of its resting height. */
  heightScale: number;
}

function bottomParts(
  pose: Pick<BottomPose, 'leading' | 'trailing' | 'heightScale'>,
  width: number,
  isRtl: boolean,
  height: number,
): BottomParts {
  const edges = bottomEdges(width);
  const direction = isRtl ? -1 : 1;
  const cap = height / 2;
  const restMiddle = Math.max(
    1,
    edges.restTrailing - edges.restLeading - 2 * cap,
  );
  return {
    shift: direction * (pose.leading - edges.restLeading),
    middleScale:
      Math.max(0, pose.trailing - pose.leading - 2 * cap) / restMiddle,
    endX: direction * (pose.trailing - edges.restTrailing),
    heightScale: pose.heightScale,
  };
}

/** A part's curve, read off the field's measured edges each frame. */
function derivedCurve(
  motion: BottomMotion,
  pick: (parts: BottomParts) => number,
  width: number,
  isRtl: boolean,
  height: number,
): MotionCurve {
  const duration = Math.max(
    motion.leading.duration,
    motion.trailing.duration,
    motion.heightScale.duration,
  );
  const at = (t: number) =>
    pick(
      bottomParts(
        {
          leading: motion.leading.at(t),
          trailing: motion.trailing.at(t),
          heightScale: motion.heightScale.at(t),
        },
        width,
        isRtl,
        height,
      ),
    );
  return {duration, at, velocity: t => slope(at, t)};
}

/** A curve times a constant (a direction). */
function scaled(curve: MotionCurve, factor: number): MotionCurve {
  return {
    duration: curve.duration,
    at: t => factor * curve.at(t),
    velocity: t => factor * curve.velocity(t),
  };
}

/** A numeric derivative, units/s. */
function slope(at: (t: number) => number, t: number): number {
  const lo = Math.max(0, t - 0.001);
  const hi = t + 0.001;
  return (at(hi) - at(lo)) / (hi - lo);
}

/**
 * The text offset nearest a client x inside a text input: the caret a tap at
 * that x would place. Measures the input's text with its own font, from its
 * content box's start edge and scroll position; null where text cannot be
 * measured.
 */
function caretOffsetAt(
  input: HTMLInputElement,
  clientX: number,
): number | null {
  const doc = input.ownerDocument;
  const style = doc.defaultView?.getComputedStyle(input);
  const context =
    style == null ? null : doc.createElement('canvas').getContext('2d');
  if (style == null || context == null) {
    return null;
  }
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const spacing = parseFloat(style.letterSpacing) || 0;
  const rect = input.getBoundingClientRect();
  const isRtl = style.direction === 'rtl';
  const contentStart = isRtl
    ? rect.right -
      (parseFloat(style.borderRightWidth) || 0) -
      (parseFloat(style.paddingRight) || 0)
    : rect.left +
      (parseFloat(style.borderLeftWidth) || 0) +
      (parseFloat(style.paddingLeft) || 0);
  const along =
    (isRtl ? contentStart - clientX : clientX - contentStart) +
    Math.abs(input.scrollLeft);
  const text = input.value;
  let best = 0;
  let bestDistance = Infinity;
  for (let offset = 0; offset <= text.length; offset++) {
    const width =
      context.measureText(text.slice(0, offset)).width + spacing * offset;
    const distance = Math.abs(width - along);
    if (distance < bestDistance) {
      best = offset;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Plays the given curves. A curve that does not move is put in place instead
 * (`set`), which also ends whatever that property was still playing (a
 * cancel's held opacity that a re-activation keeps at 1 would otherwise drop
 * to 0 when the cancel's clock ends); an animation with no visible change
 * would also run on the main thread in Chromium.
 */
function play(
  animator: Animator,
  curves: Partial<
    Record<'x' | 'y' | 'scale' | 'scaleX' | 'scaleY' | 'opacity', MotionCurve>
  >,
  options: AnimateOptions,
): MotionHandle | null {
  const moving: typeof curves = {};
  for (const [key, curve] of Object.entries(curves) as [
    keyof typeof curves,
    MotionCurve,
  ][]) {
    const first = curve.at(0);
    // A curve can leave its value and come back (the bottom field's swell),
    // so look along it, not only at its ends.
    const moves = Array.from({length: 33}, (_, i) =>
      curve.at((curve.duration * i) / 32),
    ).some(value => Math.abs(value - first) > 1e-6);
    if (moves) {
      moving[key] = curve;
    } else {
      animator.set({[key]: first});
    }
  }
  if (Object.keys(moving).length === 0) {
    return null;
  }
  return animator.play(moving, options);
}
