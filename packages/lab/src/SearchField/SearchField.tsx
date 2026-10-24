// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SearchField.tsx
 * @input React, StyleX, core's theme tokens, Icon, the touch presentation
 *   resolver, the compositor animator and the UIKit search table
 *   (`@astryxdesign/core/motion/experimental`), searchFieldModel.ts for the
 *   math
 * @output Exports SearchField (the phone search field of iOS 26's
 *   UISearchController: a field that activates into its host's bar with a
 *   glass close button) and the SearchFieldHandle type
 * @position Lab component (packages/lab/src/SearchField); the field a
 *   navigation stack's bar or a tab bar's search tab hosts, standalone in a
 *   page header otherwise
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
 * its own tap so the keyboard rises) activates it. In the iOS idiom (WebKit
 * on iOS or iPadOS under a finger) the field then plays UIKit's activation,
 * all on one clock
 * (`search.activationMs`, 383 ms on `search.activationCurve`, the
 * UIViewPropertyAnimator UIKit uses; both are motion roles a theme may
 * retune, read when each move starts): it rises by the host's `lift`, it
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
 * mid-flight starts from where every part is. Anywhere else (an Android
 * finger, a mouse) the parts take their places at once, and the close button
 * is a plain round button instead of glass: the motion and the glass are
 * iOS's idiom. Under reduced motion it follows `design:reduced-motion`: on a
 * touch screen, in any idiom, the parts cross-fade to their places (the
 * animator replaces the travel with a fade); otherwise they change at once.
 *
 * Search with the keyboard's Search key (Enter) calls `onSubmit`; focus and
 * the keyboard stay, as UIKit leaves them to the app. A tap outside ends
 * editing but leaves the search active, as UIKit does when the results do
 * not dim (`obscuresBackgroundDuringPresentation` false, its default).
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
  type MouseEvent,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {Icon} from '@astryxdesign/core/Icon';
import {useMergedRefs} from '@astryxdesign/core/hooks';
import {useTranslator} from '@astryxdesign/core/i18n';
import {useTouchPresentation} from '@astryxdesign/core/gestures/experimental';
import {
  uikit,
  useAnimator,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '@astryxdesign/core/motion/experimental';
import {
  colorVars,
  radiusVars,
  shadowVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {onPresentedFrame} from '../presentedFrame';
import {
  activationTiming,
  easedCurve,
  heldCurve,
  poseFor,
  remainingFraction,
  type SearchFieldGeometry,
  type SearchFieldPose,
} from './searchFieldModel';

const {search} = uikit;

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
  /** The close button's accessible name (default: "Cancel", translated). */
  cancelLabel?: string;
  /** The clear button's accessible name (default: "Clear text", translated). */
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
    // The inactive close button waits past the field's end (it slides in
    // from there, as UIKit's does from beyond the screen's edge); clipping
    // the inline overflow keeps it from widening the page, which would
    // otherwise scroll sideways on a phone.
    overflowX: 'clip',
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
    // Glass in the iOS idiom only (nested as IOS_TOUCH_STYLE_KEYS spells
    // it); elsewhere a plain round button in the field's own fill.
    backgroundColor: {
      default: colorVars['--color-background-muted'],
      '@media (pointer: coarse)': {
        default: colorVars['--color-background-muted'],
        '@supports (-webkit-touch-callout: none)': `color-mix(in srgb, ${colorVars['--color-background-popover']} 78%, transparent)`,
      },
    },
    backdropFilter: {
      default: 'none',
      '@media (pointer: coarse)': {
        default: 'none',
        '@supports (-webkit-touch-callout: none)': 'blur(16px) saturate(180%)',
      },
    },
    boxShadow: {
      default: 'none',
      '@media (pointer: coarse)': {
        default: 'none',
        '@supports (-webkit-touch-callout: none)': shadowVars['--shadow-med'],
      },
    },
    color: colorVars['--color-text-primary'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  },
  closeGeometry: (size: string, inset: string) => ({
    width: size,
    height: size,
    insetInlineEnd: inset,
  }),
  // Inactive, the close button is transparent (the animator holds its
  // opacity at 0) and takes no taps.
  // The resting (inactive) close button, in CSS so a server-rendered page
  // paints it transparent and out of place before the animator's held
  // values take over: 44 px toward the trailing end
  // (`search.stacked.closeTravel`, kept equal by a test).
  closeInert: {
    pointerEvents: 'none',
    opacity: 0,
    translate: {
      default: '44px 0',
      ':is([dir="rtl"] *)': '-44px 0',
    },
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
  cancelLabel,
  clearLabel,
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
  const rootRef = useRef<HTMLDivElement>(null);
  const t = useTranslator();
  const resolvedCancelLabel = cancelLabel ?? t('@astryx.searchField.cancel');
  const resolvedClearLabel = clearLabel ?? t('@astryx.searchField.clear');
  const fieldRef = useRef<HTMLDivElement>(null);
  const rootAnimator = useAnimator();
  const middleAnimator = useAnimator();
  const endAnimator = useAnimator();
  const closeAnimator = useAnimator();
  // UIKit's activation in the iOS idiom (WebKit on iOS or iPadOS under a
  // finger); anywhere else (an Android finger, a mouse) the parts take their
  // places at once. Under reduced motion a touch screen takes the animated
  // path in any idiom, and the animator turns its travel into a cross-fade
  // (`design:reduced-motion` DR2); a fine pointer changes at once (DR3).
  const {idiom} = useTouchPresentation();
  const playsUIKit = idiom === 'ios';
  const animates = useCallback(
    () => playsUIKit || rootAnimator.animator.reducedMotion() === 'crossfade',
    [playsUIKit, rootAnimator],
  );

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

  const fieldHeight = search.stacked.fieldHeight;
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
    const target = isActive;
    if (settledRef.current === null || !animates()) {
      // First layout, or outside the iOS idiom (and not a reduced-motion
      // cross-fade on a touch screen): take the places at once.
      settledRef.current = target;
      place(poseFor(target, geometry()));
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      place(poseFor(target, geometry()));
      return;
    }
    settledRef.current = target;
    isAnimating.current = true;
    let cancelled = false;
    const run = () => {
      const shape = geometry();
      const to = poseFor(target, shape);
      const from = poseFor(!target, shape);
      const current = presented();
      // The clock and curve under the field's theme, read as the move starts.
      const timing = activationTiming(rootAnimator.animator.element);
      const duration = timing.seconds * remainingFraction(current, from, to);
      // Under reduced motion the animator plays its cross-fade for these.
      const options = {};
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
    };
    // The move starts on the first frame the page presents after this
    // commit, fresh (onPresentedFrame): Mobile Safari brings the keyboard up
    // with no frame for ~150 ms after the focus, and a motion created before
    // that stall would jump a third of the way when frames resume. A host
    // that moves with the field (a navigation bar) starts through the same
    // helper, so both start on the same frame.
    const win = rootAnimator.animator.element?.ownerDocument.defaultView;
    let cancelStart = () => {};
    if (win == null) {
      run();
    } else {
      cancelStart = onPresentedFrame(win, run);
    }
    return () => {
      cancelled = true;
      cancelStart();
    };
    // `geometry` changes with `lift`; a lift change while settled re-places
    // the field through the same path.
  }, [
    isActive,
    animates,
    geometry,
    place,
    presented,
    rootAnimator,
    middleAnimator,
    endAnimator,
    closeAnimator,
  ]);

  // A resize while settled (the window turning, a host relaying out) moves
  // the narrowed end to the new width at once.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const Observer = field?.ownerDocument.defaultView?.ResizeObserver;
    if (field == null || Observer == null) {
      return;
    }
    const observer = new Observer(() => {
      if (!isAnimating.current && settledRef.current !== null) {
        place(poseFor(settledRef.current, geometry()));
      }
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [geometry, place]);

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

  // A cancel from the keyboard (Escape in the field, or the close button
  // with focus) leaves focus on the search landmark: the close button turns
  // `aria-hidden` and transparent at once, and the field would activate
  // again if it took focus. The landmark takes focus only for this, and
  // lets it go once focus moves on, so Tab continues from the field.
  const keepFocusOnLandmark = useCallback(() => {
    const root = rootRef.current;
    if (root == null) {
      return;
    }
    root.tabIndex = -1;
    root.addEventListener('blur', () => root.removeAttribute('tabindex'), {
      once: true,
    });
    root.focus({preventScroll: true});
  }, []);
  const handleClose = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const hadFocus = button.ownerDocument.activeElement === button;
      cancel();
      if (hadFocus) {
        keepFocusOnLandmark();
      }
    },
    [cancel, keepFocusOnLandmark],
  );

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
        keepFocusOnLandmark();
      }
    },
    [onSubmit, value, isActive, cancel, keepFocusOnLandmark],
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
  // the narrowed field gives up to the close button.
  const inputEnd =
    (showsClear ? search.clear.size + CLEAR_INSET : 0) +
    (isActive ? search.stacked.closeGap + search.stacked.closeSize : 0) +
    (showsClear ? 0 : CLEAR_INSET);

  return (
    <div
      {...rest}
      ref={useMergedRefs(ref, rootAnimator.ref, rootRef)}
      role="search"
      data-search-field-active={isActive || undefined}
      {...mergeProps(
        themeProps('search-field'),
        stylex.props(
          styles.root,
          styles.rootInset(px(search.stacked.fieldInset)),
          xstyle,
        ),
        className,
        style,
      )}>
      <div
        ref={fieldRef}
        {...stylex.props(styles.field, styles.fieldHeight(px(fieldHeight)))}>
        <span aria-hidden {...stylex.props(styles.piece, styles.start(cap))} />
        <span
          ref={middleAnimator.ref}
          aria-hidden
          data-search-field-middle=""
          {...stylex.props(styles.piece, styles.middle(cap))}
        />
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
        <div
          ref={endAnimator.ref}
          data-search-field-end=""
          {...stylex.props(styles.end)}>
          <span aria-hidden {...stylex.props(styles.endCap(cap))} />
          {showsClear ? (
            <button
              type="button"
              aria-label={resolvedClearLabel}
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
        aria-label={resolvedCancelLabel}
        tabIndex={isActive ? undefined : -1}
        aria-hidden={isActive ? undefined : true}
        data-search-field-close=""
        onClick={handleClose}
        {...stylex.props(
          styles.close,
          styles.closeGeometry(
            px(search.stacked.closeSize),
            px(search.stacked.fieldInset),
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

/**
 * Plays the given curves. A curve that does not move is put in place instead
 * (`set`), which also ends whatever that property was still playing (a
 * cancel's held opacity that a re-activation keeps at 1 would otherwise drop
 * to 0 when the cancel's clock ends); an animation with no visible change
 * would also run on the main thread in Chromium.
 */
function play(
  animator: Animator,
  curves: Partial<Record<'x' | 'y' | 'scaleX' | 'opacity', MotionCurve>>,
  options: {at?: number},
): MotionHandle | null {
  const moving: typeof curves = {};
  for (const [key, curve] of Object.entries(curves) as [
    keyof typeof curves,
    MotionCurve,
  ][]) {
    if (Math.abs(curve.at(curve.duration) - curve.at(0)) > 1e-6) {
      moving[key] = curve;
    } else {
      animator.set({[key]: curve.at(0)});
    }
  }
  if (Object.keys(moving).length === 0) {
    return null;
  }
  return animator.play(moving, options);
}
