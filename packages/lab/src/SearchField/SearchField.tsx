// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SearchField.tsx
 * @input React, StyleX, core's theme tokens, Icon, the touch presentation
 *   resolver, the compositor animator and the UIKit search table
 *   (`@astryxdesign/core/motion/experimental`), the keyboard layout guide
 *   (`@astryxdesign/core/keyboard/experimental`), searchFieldModel.ts for
 *   the math
 * @output Exports SearchField (the phone search field of iOS 26's
 *   UISearchController: a field that activates into its host's bar with a
 *   glass close button) and the SearchFieldHandle type
 * @position Lab component (packages/lab/src/SearchField); the field a
 *   navigation stack's bar or a tab bar's search tab hosts, standalone in a
 *   page header otherwise, or in a bottom toolbar (`placement="bottom"`)
 *
 * WHAT IT DRAWS
 *
 * A rounded field (uikit/search.ts: 44 px tall, 16 px from each side) with
 * a magnifier, the query and, once there is text, a clear button that
 * appears and disappears at once, as UIKit's does. The input asks a touch
 * keyboard for its Search key and no autocorrection, as a UIKit search
 * field's text field does.
 *
 * ACTIVATION
 *
 * Focusing the field (a tap, or the host calling `handleRef.focus()` inside
 * its own tap so the keyboard rises) activates it. Under a finger (touch
 * presentation) the field then plays UIKit's activation, all on one clock
 * (`search.activationMs`, 383 ms on `search.activationCurve`, the
 * UIViewPropertyAnimator UIKit uses): it rises by the host's `lift`, it
 * narrows to make room for the close button, and the glass close button
 * slides in from 44 px past its place while it fades in. Every part moves
 * on the compositor (translate, scale, opacity), so the activation keeps
 * moving while the page's script runs. The field narrows without
 * re-laying out: its background is three pieces, two rounded ends and a
 * middle that scales, and the trailing end slides.
 *
 * The close button cancels: it clears the text, ends editing (the keyboard
 * leaves) and plays the activation back to rest, the button sliding out at
 * the opacity it has, then hiding. Escape does the same. A change of mind
 * mid-flight starts from where every part is. Reduce Motion keeps the
 * travel and adds no cross-fade, as iOS does (`search.reducedMotion`).
 * Under a mouse (pointer presentation) the parts take their places at once.
 *
 * Search with the keyboard's Search key (Enter) calls `onSubmit`; focus and
 * the keyboard stay, as UIKit leaves them to the app. A tap outside ends
 * editing but leaves the search active, as UIKit does when the results do
 * not dim (`obscuresBackgroundDuringPresentation` false, its default).
 *
 * BOTTOM PLACEMENT
 *
 * `placement="bottom"` is iOS 26's toolbar field on a phone (UIKit's
 * `.integrated`): 38 px tall, 33 px from each side, in a bar the app keeps
 * at the bottom of the viewport. It rides the software keyboard on the
 * keyboard's own spring, through the keyboard layout guide: while active
 * its centre stays 36 px above the keyboard's top (a 17 px gap), otherwise
 * the bar keeps its resting gap above the keyboard. Activating swells the
 * field, narrows it past its place to make room for a 38 px glass close
 * button 22 px after it, and grows the button in from inside the field's
 * end; cancelling narrows the field by 16 px at each side, then springs it
 * out to rest while the button shrinks and fades in place. iOS draws these
 * frame by frame with no animation object, so they play the measured
 * frames (`search.bottom.*Frames`), on the compositor.
 *
 * Accessibility: a `search` landmark holding a `searchbox` named by
 * `label`; the clear and close buttons are named by `clearLabel` and
 * `cancelLabel`. The close button is in the tab order only while active.
 *
 * SYNC: When modified, update SearchField.doc.mjs, SearchField.test.tsx,
 * searchFieldModel.ts and __tests__/SearchField.interaction.browser.spec.ts.
 */

import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {Icon} from '@astryxdesign/core/Icon';
import {useMergedRefs} from '@astryxdesign/core/hooks';
import {
  TapGestureRecognizer,
  useGestureRecognizer,
  useTouchPresentation,
} from '@astryxdesign/core/gestures/experimental';
import {
  uikit,
  useAnimator,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '@astryxdesign/core/motion/experimental';
import {
  getKeyboardLayoutGuide,
  type KeyboardLayoutGuide,
  type KeyboardTransition,
} from '@astryxdesign/core/keyboard/experimental';
import {
  colorVars,
  radiusVars,
  shadowVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {
  ACTIVATION_S,
  bottomEdges,
  bottomMotion,
  bottomPoseFor,
  bottomRise,
  easedCurve,
  heldCurve,
  poseFor,
  remainingFraction,
  type BottomPose,
  type SearchFieldGeometry,
  type SearchFieldPose,
} from './searchFieldModel';

const {search, springs} = uikit;
const {bottom} = search;

// =============================================================================
// Types
// =============================================================================

/** What `handleRef` exposes: focus and blur the field's input. */
export interface SearchFieldHandle {
  /**
   * Focuses the input. Called inside a tap, it raises the touch keyboard
   * and activates the field.
   */
  focus(): void;
  /** Ends editing; the field stays active. */
  blur(): void;
}

export interface SearchFieldProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'onSubmit'
> {
  /** The field's accessible name; also its placeholder by default. */
  label: string;
  /** Placeholder text. Defaults to `label`. */
  placeholder?: string;
  /** The query (controlled). */
  value?: string;
  /** The initial query (uncontrolled). */
  defaultValue?: string;
  /** Called with the new query on every edit, and with '' on clear or cancel. */
  onChange?: (value: string) => void;
  /** Whether search is active (controlled). */
  isActive?: boolean;
  /** Whether search starts active (uncontrolled). */
  defaultIsActive?: boolean;
  /** Called when the field activates (it gains focus) or is cancelled. */
  onActiveChange?: (isActive: boolean) => void;
  /** Called with the query when the keyboard's Search key (Enter) is used. */
  onSubmit?: (value: string) => void;
  /** Focus and blur, for a host that activates the field from its own tap. */
  handleRef?: Ref<SearchFieldHandle>;
  /**
   * How far the active field rises into its host's bar, px: the host knows
   * the distance (a navigation bar lifts the field from under its large
   * title to the bar's row). 0, the default, keeps it in place.
   */
  lift?: number;
  /**
   * Where the field lives: `stacked` (default) in a page header or under a
   * navigation bar's title, or `bottom`, iOS 26's toolbar field, in a bar
   * the app keeps at the bottom of the viewport; it rides the software
   * keyboard. `lift` applies to `stacked` only.
   */
  placement?: 'stacked' | 'bottom';
  /** The close button's accessible name. */
  cancelLabel?: string;
  /** The clear button's accessible name. */
  clearLabel?: string;
  /** The root element (the `search` landmark). */
  ref?: Ref<HTMLDivElement>;
}

// =============================================================================
// Styles
// =============================================================================

const px = (value: number) => `${value}px`;

const styles = stylex.create({
  root: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    // No browser tap highlight over the field or its buttons: UIKit's has
    // none, and Chromium's fades on the main thread, painting every frame.
    WebkitTapHighlightColor: 'transparent',
  },
  rootInset: (inset: string) => ({paddingInline: inset}),
  field: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  fieldHeight: (height: string) => ({height}),
  // The background: two rounded ends and a middle that scales, so the field
  // narrows on the compositor without re-laying out.
  piece: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colorVars['--color-background-muted'],
    pointerEvents: 'none',
  },
  start: (cap: string) => ({
    insetInlineStart: 0,
    width: cap,
    borderStartStartRadius: cap,
    borderEndStartRadius: cap,
  }),
  middle: (cap: string) => ({
    insetInlineStart: cap,
    insetInlineEnd: cap,
    transformOrigin: {
      default: 'left center',
      ':is([dir="rtl"] *)': 'right center',
    },
  }),
  end: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
  },
  // One px wider than the rounded end, reaching under the middle so the two
  // never show an antialiased seam while they move.
  endCap: (cap: string) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: `calc(${cap} + 1px)`,
    borderStartEndRadius: cap,
    borderEndEndRadius: cap,
    backgroundColor: colorVars['--color-background-muted'],
  }),
  content: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
  },
  magnifier: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    marginInlineStart: 12,
    color: colorVars['--color-text-secondary'],
    pointerEvents: 'none',
  },
  input: {
    position: 'relative',
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
    margin: 0,
    paddingBlock: 0,
    paddingInlineStart: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    // 17 px, iOS's body size; at least 16 px also keeps iOS from zooming
    // into the field on focus.
    fontSize: textSizeVars['--font-size-lg'],
    fontFamily: 'inherit',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputEnd: (end: string) => ({paddingInlineEnd: end}),
  clear: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-text-secondary'],
    color: colorVars['--color-background-body'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    pointerEvents: 'auto',
    WebkitTapHighlightColor: 'transparent',
  },
  clearGeometry: (size: string, inset: string) => ({
    width: size,
    height: size,
    marginInlineEnd: inset,
  }),
  close: {
    position: 'absolute',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderWidth: 0,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-background-popover']} 78%, transparent)`,
    backdropFilter: 'blur(16px) saturate(180%)',
    boxShadow: shadowVars['--shadow-med'],
    color: colorVars['--color-text-primary'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  },
  closeGeometry: (size: string, inset: string, top: string) => ({
    width: size,
    height: size,
    insetInlineEnd: inset,
    top,
  }),
  // Inactive, the close button is transparent (the animator holds its
  // opacity at 0) and takes no taps.
  closeInert: {
    pointerEvents: 'none',
  },
});

// Where the clear button sits inside the field's trailing end, px.
const CLEAR_INSET = 10;

// =============================================================================
// Component
// =============================================================================

/**
 * The search field of iOS 26's UISearchController for a phone: it
 * activates into its host's bar with a glass close button, on UIKit's
 * clock.
 *
 * @example
 * ```
 * const [query, setQuery] = useState('');
 * <SearchField label="Search" value={query} onChange={setQuery} />
 * ```
 */
export function SearchField({
  label,
  placeholder,
  value: valueProp,
  defaultValue = '',
  onChange,
  isActive: isActiveProp,
  defaultIsActive = false,
  onActiveChange,
  onSubmit,
  handleRef,
  lift = 0,
  placement = 'stacked',
  cancelLabel = 'Cancel',
  clearLabel = 'Clear text',
  xstyle,
  className,
  style,
  ref,
  ...rest
}: SearchFieldProps) {
  const [valueState, setValueState] = useState(defaultValue);
  const value = valueProp ?? valueState;
  const [isActiveState, setIsActiveState] = useState(defaultIsActive);
  const isActive = isActiveProp ?? isActiveState;

  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const rootAnimator = useAnimator();
  const startAnimator = useAnimator();
  const contentAnimator = useAnimator();
  const middleAnimator = useAnimator();
  const endAnimator = useAnimator();
  const endCapAnimator = useAnimator();
  const closeAnimator = useAnimator();
  const isBottom = placement === 'bottom';
  // UIKit's activation under a finger; the parts take their places at once
  // under a mouse.
  const {isTouch} = useTouchPresentation();

  const setValue = useCallback(
    (next: string) => {
      if (valueProp === undefined) {
        setValueState(next);
      }
      onChange?.(next);
    },
    [valueProp, onChange],
  );
  const setActive = useCallback(
    (next: boolean) => {
      if (isActiveProp === undefined) {
        setIsActiveState(next);
      }
      onActiveChange?.(next);
    },
    [isActiveProp, onActiveChange],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      focus() {
        inputRef.current?.focus();
      },
      blur() {
        inputRef.current?.blur();
      },
    }),
    [],
  );

  // ---------------------------------------------------------------------------
  // Motion
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
      isRtl:
        field != null &&
        field.ownerDocument.defaultView?.getComputedStyle(field).direction ===
          'rtl',
    };
  }, [fieldHeight, lift]);

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
    if (isBottom) {
      return;
    }
    const target = isActive;
    const shape = geometry();
    const to = poseFor(target, shape);
    if (settledRef.current === null || !isTouch) {
      // First layout, or a pointer presentation: take the places at once.
      settledRef.current = target;
      place(to);
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      place(to);
      return;
    }
    settledRef.current = target;
    const from = poseFor(!target, shape);
    const current = presented();
    const duration = ACTIVATION_S * remainingFraction(current, from, to);
    const options = {reducedMotion: search.reducedMotion};
    isAnimating.current = true;
    const handles = [
      play(
        rootAnimator.animator,
        {y: easedCurve(current.y, to.y, duration)},
        options,
      ),
      play(
        middleAnimator.animator,
        {scaleX: easedCurve(current.middleScale, to.middleScale, duration)},
        options,
      ),
      play(
        endAnimator.animator,
        {x: easedCurve(current.endX, to.endX, duration)},
        options,
      ),
      play(
        closeAnimator.animator,
        {
          x: easedCurve(current.closeX, to.closeX, duration),
          // Cancel slides the close button out at the opacity it has and
          // removes it at the end, as UIKit does.
          opacity: target
            ? easedCurve(current.closeOpacity, to.closeOpacity, duration)
            : heldCurve(current.closeOpacity, to.closeOpacity, duration),
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
    // `geometry` changes with `lift`; a lift change while settled re-places
    // the field through the same path.
  }, [
    isBottom,
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
  // Bottom placement: the measured gel, and the ride on the keyboard
  // ---------------------------------------------------------------------------

  const bottomShape = useCallback(() => {
    const root = rootAnimator.animator.element;
    return {
      width: root?.clientWidth ?? 0,
      isRtl:
        root != null &&
        root.ownerDocument.defaultView?.getComputedStyle(root).direction ===
          'rtl',
    };
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

  useLayoutEffect(() => {
    if (!isBottom) {
      return;
    }
    const target = isActive;
    const {width, isRtl} = bottomShape();
    if (settledRef.current === null || !isTouch) {
      // First layout, or a pointer presentation: take the places at once.
      settledRef.current = target;
      placeBottom(bottomPoseFor(target, width));
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      placeBottom(bottomPoseFor(target, width));
      return;
    }
    settledRef.current = target;
    // iOS changes the field's frame each frame with no animation object:
    // play the measured frames, every part on one clock.
    const motion = bottomMotion(target, width);
    const direction = isRtl ? -1 : 1;
    const part = (pick: (parts: BottomParts) => number) =>
      derivedCurve(motion, parts => pick(parts), width, isRtl, fieldHeight);
    const options = {
      at: rootAnimator.animator.element?.ownerDocument.defaultView?.performance.now(),
      reducedMotion: search.reducedMotion,
    };
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
    fieldHeight,
    rootAnimator,
    startAnimator,
    contentAnimator,
    middleAnimator,
    endAnimator,
    endCapAnimator,
    closeAnimator,
  ]);

  // The bar rides the software keyboard on the keyboard's own spring, from
  // the moment the keyboard layout guide dates the keyboard's motion to:
  // while active the field's centre stays 36 px above the keyboard's top,
  // otherwise the bar keeps its resting gap above it. A pointer
  // presentation has no software keyboard and stays put.
  const isActiveRef = useRef(isActive);
  const follow = useCallback(
    (transition: KeyboardTransition, at?: number) => {
      const root = rootAnimator.animator.element;
      const win = root?.ownerDocument.defaultView;
      if (!isBottom || !isTouch || root == null || win == null) {
        return;
      }
      const rect = root.getBoundingClientRect();
      // The resting centre: where layout puts the field, without the rise.
      const restCenter =
        rect.top - rootAnimator.animator.get('y') + rect.height / 2;
      const restGap = win.innerHeight - restCenter;
      const to = bottomRise(isActiveRef.current, transition.to, restGap);
      if (!transition.animated) {
        rootAnimator.animator.set({y: to});
        return;
      }
      rootAnimator.animator.animate(
        {y: to},
        {spring: springs.keyboard},
        {at: at ?? transition.start, reducedMotion: 'keep'},
      );
    },
    [isBottom, isTouch, rootAnimator],
  );
  // A tap on a bottom field's text focuses it without Safari's reveal
  // (`preventScroll`): Safari would otherwise pan the whole page up to show a
  // field the keyboard is about to cover, and the bar would not ride the
  // keyboard. The tap is the gesture system's: recognizing it cancels the
  // browser's own focus for that touch. Taps on the buttons, and taps once
  // the text has focus, stay the browser's.
  const isBottomRef = useRef(isBottom);
  useLayoutEffect(() => {
    isBottomRef.current = isBottom;
  }, [isBottom]);
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
            isBottomRef.current &&
            input != null &&
            input.ownerDocument.activeElement !== input &&
            !(target?.closest?.('button') != null)
          );
        },
      }),
    tap => {
      if (tap.state === 'ended') {
        inputRef.current?.focus({preventScroll: true});
      }
    },
  );

  // Only a bottom field under a finger listens to the keyboard: the guide
  // watches frames around each focus, which a stacked field never needs.
  const [guide, setGuide] = useState<KeyboardLayoutGuide | null>(null);
  useLayoutEffect(() => {
    const win = rootAnimator.animator.element?.ownerDocument.defaultView;
    if (!isBottom || !isTouch || win == null) {
      setGuide(null);
      return undefined;
    }
    const next = getKeyboardLayoutGuide(win);
    setGuide(next);
    return next.subscribe(transition => follow(transition));
  }, [isBottom, isTouch, follow, rootAnimator]);
  useLayoutEffect(() => {
    const changed = isActiveRef.current !== isActive;
    isActiveRef.current = isActive;
    const root = rootAnimator.animator.element;
    const win = root?.ownerDocument.defaultView;
    if (!isBottom || guide == null || root == null || win == null) {
      return;
    }
    if (!isTouch) {
      rootAnimator.animator.set({y: 0});
      return;
    }
    // Activating or cancelling re-pins the field to the keyboard where it
    // is now, as iOS does on its first frame; a keyboard still moving
    // carries it on from there.
    const now = win.performance.now();
    const inset = guide.presentation(now);
    const rect = root.getBoundingClientRect();
    const restCenter =
      rect.top - rootAnimator.animator.get('y') + rect.height / 2;
    const restGap = win.innerHeight - restCenter;
    rootAnimator.animator.set({y: bottomRise(isActive, inset, restGap)});
    if (changed && Math.abs(guide.inset - inset) > 0.5) {
      follow(guide.transition, now);
    }
  }, [isBottom, isActive, isTouch, guide, follow, rootAnimator]);

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
  }, [isBottom, geometry, place, placeBottom, bottomShape]);

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  const handleFocus = useCallback(() => {
    if (!isActive) {
      setActive(true);
    }
  }, [isActive, setActive]);

  const cancel = useCallback(() => {
    setValue('');
    inputRef.current?.blur();
    setActive(false);
  }, [setValue, setActive]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        onSubmit?.(value);
      } else if (event.key === 'Escape' && isActive) {
        event.preventDefault();
        cancel();
      }
    },
    [onSubmit, value, isActive, cancel],
  );

  // The clear button keeps the input's focus (its press never takes it) and,
  // tapped while not editing, focuses the input inside the tap, so the
  // keyboard rises, as UIKit's clear button makes its field first responder.
  const handleClear = useCallback(() => {
    setValue('');
    inputRef.current?.focus();
  }, [setValue]);

  const cap = px(fieldHeight / 2);
  const showsClear = value !== '';
  // Text stops before the clear button and, while active, before the space
  // the narrowed field gives up to the close button (at the bottom, less
  // the leading edge's own move, which carries the text with it).
  const bottomShift = (() => {
    const edges = bottomEdges(0);
    return (
      edges.restTrailing -
      edges.activeTrailing -
      (edges.restLeading - edges.activeLeading)
    );
  })();
  const inputEnd =
    (showsClear ? search.clear.size + CLEAR_INSET : 0) +
    (isActive
      ? isBottom
        ? bottomShift
        : search.stacked.closeGap + search.stacked.closeSize
      : 0) +
    (showsClear ? 0 : CLEAR_INSET);
  const closeSize = isBottom ? bottom.closeSize : search.stacked.closeSize;
  const closeInset = isBottom ? bottom.activeInset : search.stacked.fieldInset;

  return (
    <div
      {...rest}
      ref={useMergedRefs(ref, rootAnimator.ref)}
      role="search"
      data-search-field-active={isActive || undefined}
      {...mergeProps(
        themeProps('search-field'),
        stylex.props(
          styles.root,
          styles.rootInset(
            px(isBottom ? bottom.restInset : search.stacked.fieldInset),
          ),
          xstyle,
        ),
        className,
        style,
      )}>
      <div
        ref={fieldRef}
        {...stylex.props(styles.field, styles.fieldHeight(px(fieldHeight)))}>
        <span
          ref={startAnimator.ref}
          aria-hidden
          data-search-field-start=""
          {...stylex.props(styles.piece, styles.start(cap))}
        />
        <span
          ref={middleAnimator.ref}
          aria-hidden
          data-search-field-middle=""
          {...stylex.props(styles.piece, styles.middle(cap))}
        />
        <div
          ref={contentAnimator.ref}
          data-search-field-content=""
          {...stylex.props(styles.content)}>
          <span aria-hidden {...stylex.props(styles.magnifier)}>
            <Icon icon="search" size="sm" color="inherit" />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label={label}
            placeholder={placeholder ?? label}
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setValue(event.target.value)
            }
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            // A UIKit search field's text field: the `.search` return key and
            // `autocorrectionType = .no` (measured on iOS 26.2).
            enterKeyHint="search"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            {...stylex.props(styles.input, styles.inputEnd(px(inputEnd)))}
          />
        </div>
        <div
          ref={endAnimator.ref}
          data-search-field-end=""
          {...stylex.props(styles.end)}>
          <span
            ref={endCapAnimator.ref}
            aria-hidden
            data-search-field-end-cap=""
            {...stylex.props(styles.endCap(cap))}
          />
          {showsClear ? (
            <button
              type="button"
              aria-label={clearLabel}
              onMouseDown={event => event.preventDefault()}
              onClick={handleClear}
              {...stylex.props(
                styles.clear,
                styles.clearGeometry(px(search.clear.size), px(CLEAR_INSET)),
              )}>
              <Icon icon="close" size="xsm" color="inherit" />
            </button>
          ) : null}
        </div>
      </div>
      <button
        ref={closeAnimator.ref}
        type="button"
        aria-label={cancelLabel}
        tabIndex={isActive ? undefined : -1}
        aria-hidden={isActive ? undefined : true}
        data-search-field-close=""
        onClick={cancel}
        {...stylex.props(
          styles.close,
          styles.closeGeometry(
            px(closeSize),
            px(closeInset),
            px((fieldHeight - closeSize) / 2),
          ),
          !isActive && styles.closeInert,
        )}>
        <Icon icon="close" size="sm" color="inherit" />
      </button>
    </div>
  );
}

SearchField.displayName = 'SearchField';

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
  motion: ReturnType<typeof bottomMotion>,
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
  options: {at?: number; reducedMotion: 'keep' | 'crossfade' | 'instant'},
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
