// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Dialog.tsx
 * @input Uses React, DialogHTMLAttributes, ReactNode, container (Layout), DialogContext
 * @output Exports Dialog component, DialogProps, DialogVariant, DialogPurpose types
 * @position Core implementation; consumed by index.ts, tested by Dialog.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Dialog/Dialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Dialog/index.ts (exports if types change)
 * - /apps/storybook/stories/Dialog.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Dialog/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {useScrollLock} from '../hooks/useScrollLock';
import {hasActiveFocusTrapEscape, isImeKeyEvent} from '../hooks/useFocusTrap';
import {
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SpacingStep} from '../utils/types';
import {mergeProps, mergeRefs} from '../utils';
import {devWarn} from '../utils/devWarning';
import {DialogContext} from './DialogContext';
import {themeProps} from '../utils/themeProps';
import type {DialogVariantMap} from './index';
import {focusOutlineProps} from '../utils/focusOutline.stylex';

/**
 * Calculate a directional translate offset for dialog entry animation.
 * Returns a normalized vector from the trigger element toward the viewport
 * center, scaled to the given distance.
 */
function getDialogDirection(
  triggerEl: HTMLElement,
  distance = 16,
): {x: number; y: number} {
  const rect = triggerEl.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: Math.round((dx / dist) * distance),
    y: Math.round((dy / dist) * distance),
  };
}

/**
 * Dialog variant type
 * - standard: Normal dialog with configurable width/height
 * - fullscreen: Takes up the entire viewport
 *
 * Extensible via module augmentation of DialogVariantMap.
 */
export type DialogVariant = keyof DialogVariantMap;

/**
 * Dialog purpose type - controls dismissal behavior
 * - required: Mandatory flows (security, permissions) - disables all exit methods
 * - form: User forms/flows - prevents backdrop click, allows escape
 * - info: Informational flows - allows all exit methods
 */
export type DialogPurpose = 'required' | 'form' | 'info';

/** Block-axis offsets — always allowed, independent of inline direction. */
interface DialogBlockPosition {
  top?: number | string;
  bottom?: number | string;
}

/**
 * Static position for a dialog. The inline axis is logical XOR physical — the
 * type forbids mixing the two, so a single dialog can't be positioned both ways:
 * - Logical `start`/`end` map to `inset-inline-*` and mirror under RTL (preferred).
 * Block-axis `top`/`bottom` may be combined with either.
 */
export interface DialogPosition extends DialogBlockPosition {
  /** Logical inline-start offset (`inset-inline-start`); mirrors under RTL. */
  start?: number | string;
  /** Logical inline-end offset (`inset-inline-end`); mirrors under RTL. */
  end?: number | string;
}

const enterDirectional = stylex.keyframes({
  from: {
    opacity: 0,
    transform:
      'translate(var(--dialog-dir-x, 0px), var(--dialog-dir-y, 16px)) scale(0.95)',
  },
  to: {opacity: 1, transform: 'translate(0, 0) scale(1)'},
});

// The entrance run backwards, so the dialog retreats toward the element that
// opened it (motion docs: "when you do animate exit, match the entrance").
const exitDirectional = stylex.keyframes({
  from: {opacity: 1, transform: 'translate(0, 0) scale(1)'},
  to: {
    opacity: 0,
    transform:
      'translate(var(--dialog-dir-x, 0px), var(--dialog-dir-y, 16px)) scale(0.95)',
  },
});

// The scrim leaves on the same curve as the panel. Without this it stays
// opaque for the whole exit and then snaps, which reads as a grey flash after
// the dialog has already faded out.
const exitBackdrop = stylex.keyframes({
  from: {opacity: 1},
  to: {opacity: 0},
});

/**
 * Dialog styles using native <dialog> element
 * Uses ::backdrop pseudo-element for overlay
 */
const styles = stylex.create({
  dialog: {
    position: 'fixed',
    margin: 'auto',
    padding: 0,
    border: 'none',
    backgroundColor: colorVars['--color-background-surface'],
    '--_dialog-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_dialog-radius)',
    boxShadow: shadowVars['--shadow-high'],
    display: 'none',
    flexDirection: 'column',
    height: 'fit-content',
    overscrollBehavior: 'contain',
    opacity: 0,
    animationDuration: durationVars['--duration-medium-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards' as const,
  },
  // Applied via isOpen prop — avoids :where([open]) attribute selectors
  // which have zero specificity and can lose to default styles depending
  // on CSS source order in the build output.
  open: {
    display: 'flex',
    opacity: 1,
    // Disable the entry keyframe animation under
    // `prefers-reduced-motion: reduce` so the dialog appears instantly
    // instead of translating/scaling in (same pattern as layerAnimations).
    animationName: {
      default: enterDirectional,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  // Applied while the dialog is closing: `isOpen` has already gone false, so
  // `open` is off and the element would otherwise be display:none in the same
  // frame. Keeps it rendered for the length of the slide-out.
  exiting: {
    display: 'flex',
    animationName: {
      default: exitDirectional,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    // Read back by resolveExitDelay() to time dialog.close() to the end of the
    // slide-out — a theme that retimes its motion scale retimes the close with
    // it.
    animationDuration: durationVars['--duration-medium-min'],
    // `both`: hold the entrance's end state until the first frame runs, and
    // the faded-out state after it, so neither edge flashes at full opacity.
    animationFillMode: 'both' as const,
    '::backdrop': {
      animationName: {
        default: exitBackdrop,
        '@media (prefers-reduced-motion: reduce)': 'none',
      },
      animationDuration: durationVars['--duration-medium-min'],
      animationTimingFunction: easeVars['--ease-standard'],
      animationFillMode: 'both' as const,
    },
  },
  // Backdrop using ::backdrop pseudo-element
  backdrop: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
    },
  },
  fullscreen: {
    width: '100dvw',
    height: '100dvh',
    maxWidth: '100dvw',
    maxHeight: '100dvh',
    borderRadius: 0,
    margin: 0,
    inset: 0,
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
  },
  // Inline wrapper mirrors the dialog's visual styles without <dialog> behavior
  inlineWrapper: {
    padding: 0,
    border: 'none',
    backgroundColor: colorVars['--color-background-surface'],
    '--_dialog-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_dialog-radius)',
    boxShadow: shadowVars['--shadow-high'],
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    overscrollBehavior: 'contain',
  },
});

// Dynamic styles for width, maxHeight, and position
const dynamicStyles = stylex.create({
  sizing: (width: number | string, maxHeight: number | string) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: '90vw',
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  }),
  position: (
    top: string,
    insetInlineStart: string,
    insetInlineEnd: string,
    bottom: string,
  ) => ({
    // Assigns pre-resolved offsets from resolveDialogPositionOffsets(). This
    // literal has no logic — StyleX can't analyze a helper, so the values
    // (logical start/end → inset-inline-*, physical left/right, `auto`
    // fallbacks) are computed at the call site and passed in.
    margin: 0,
    top,
    insetInlineStart,
    insetInlineEnd,
    bottom,
  }),
});

/**
 * Format position value - numbers become pixels, strings pass through, undefined becomes null
 */
function formatPosition(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// =============================================================================
// Close timing
// =============================================================================

/** Longest the dialog stays modal after `isOpen` goes false, whatever the theme asks for. */
const MAX_EXIT_DELAY_MS = 400;

/**
 * A CSS `<time>` in ms; null when the value isn't one.
 *
 * Browsers serialise computed times in seconds — an authored `310ms` reads
 * back as `"0.31s"` — and a list gives one entry per animation. Outside a real
 * browser there is no StyleX-authored CSS at all and the value is empty.
 *
 * @internal Exported for unit tests.
 */
export function parseExitDurationMs(value: string): number | null {
  const trimmed = value.split(',')[0]?.trim() ?? '';
  const ms = Number.parseFloat(trimmed);
  if (!Number.isFinite(ms)) {
    return null;
  }
  return trimmed.endsWith('ms') ? ms : trimmed.endsWith('s') ? ms * 1000 : null;
}

/**
 * How long to hold the open `<dialog>` so the exit animation can play.
 *
 * Read off the dialog once the `exiting` style is on it, so the hold is
 * whatever that animation actually runs for — including a theme that retimes
 * the motion scale underneath it.
 *
 * Zero — close in the same tick, exactly as the dialog behaved before there
 * was an exit animation — whenever there is no animation to wait for: reduced
 * motion, a theme that zeroes the duration, or a context where the duration
 * can't be read at all (jsdom, an unresolved `var()`). Degrading to the old
 * instant close is always safe here; unlike MobileNav's `display` hold, an
 * early close only costs the animation, it can't strand the page inert.
 */
function resolveExitDelay(dialog: HTMLDialogElement): number {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  const duration = parseExitDurationMs(
    window.getComputedStyle(dialog).animationDuration,
  );
  if (duration === null || duration <= 0) {
    return 0;
  }
  return Math.min(MAX_EXIT_DELAY_MS, duration);
}

/**
 * Map a {@link DialogPosition} to resolved CSS offsets. Logical `start`/`end`
 * become `inset-inline-*` (mirror under RTL); each unset offset falls back to
 * `auto`.
 *
 * Not re-exported from the package; internal to Dialog. Directly unit-tested
 * so the mapping is verified without StyleX class compilation.
 *
 * @see DialogPosition
 */
export function resolveDialogPositionOffsets(position: DialogPosition) {
  const {top, bottom, start, end} = position;

  return {
    top: top !== undefined ? formatPosition(top) : 'auto',
    bottom: bottom !== undefined ? formatPosition(bottom) : 'auto',
    // Logical offsets mirror under RTL (preferred replacements).
    insetInlineStart: start !== undefined ? formatPosition(start) : 'auto',
    insetInlineEnd: end !== undefined ? formatPosition(end) : 'auto',
  };
}

export interface DialogProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;

  /**
   * Renders dialog content inline without the <dialog> element, backdrop,
   * modal behavior, or dialog-managed autofocus. Intended for documentation
   * previews and showcases only — not for production UIs. The dialog will not
   * trap focus or respond to Escape.
   * @default false
   */
  isInline?: boolean;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when the dialog requests to be hidden.
   * Behavior depends on the `purpose` prop:
   * - required: Never called automatically
   * - form: Called on Escape key only
   * - info: Called on Escape key and backdrop click
   */
  onOpenChange: (isOpen: boolean) => unknown;

  /**
   * The width of the dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * Ignored when variant is 'fullscreen'.
   * @default 400
   */
  width?: number | string;

  /**
   * The maximum height of the dialog.
   * The actual height will be the height of its content.
   * Numbers are treated as pixels, strings are used as-is.
   * Ignored when variant is 'fullscreen'.
   * @default '75vh'
   */
  maxHeight?: number | string;

  /**
   * Static position for the dialog on screen.
   * By default, the dialog will be centered.
   * Ignored when variant is 'fullscreen'.
   */
  position?: Readonly<DialogPosition>;

  /**
   * The variant of the dialog.
   * - standard: Normal dialog with configurable dimensions
   * - fullscreen: Takes up the entire viewport
   * @default 'standard'
   */
  variant?: DialogVariant;

  /**
   * Configures how the dialog enables dismissals.
   * - required: Disables all exit methods (for mandatory flows)
   * - form: Prevents backdrop click, allows Escape key
   * - info: Allows all exit methods (Escape and backdrop click)
   * @default 'info'
   */
  purpose?: DialogPurpose;

  /**
   * Internal padding of the dialog using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * When omitted, uses the theme default for dialogs.
   */
  padding?: SpacingStep;

  /**
   * The content of the dialog.
   * Typically an Layout with header, content, and footer slots.
   */
  children: ReactNode;
}

/**
 * A dialog component using the native <dialog> element.
 *
 * Designed to be used with Layout as its child for structured content.
 * Uses the browser's built-in modal behavior for optimal accessibility.
 * When a DialogHeader is rendered inside, its title automatically names the
 * dialog via aria-labelledby; pass `aria-label` or `aria-labelledby` to
 * override.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <Layout
 *     header={<DialogHeader title="Title" onOpenChange={open => setIsOpen(open)} />}
 *     content={<LayoutContent>Content</LayoutContent>}
 *     footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
 *   />
 * </Dialog>
 * ```
 */
export function Dialog({
  isOpen,
  isInline = false,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  purpose = 'info',
  padding,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: DialogProps) {
  // When no explicit padding prop, use theme default (--astryx-dialog-padding)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  const isFullscreen = variant === 'fullscreen';

  // Default accessible name: publish a title id through DialogContext so a
  // DialogHeader applies it to its heading (mirrors AlertDialog's explicit
  // useId wiring). Whether to emit the default aria-labelledby is decided
  // imperatively in the callback ref below by checking whether the title
  // element actually rendered — so a dialog with no header never points at a
  // missing id, and we avoid the extra render a registration-via-state effect
  // would cost at the dialog level.
  const titleId = useId();

  const dialogContextValue = useMemo(
    () => ({isInline, titleId}),
    [isInline, titleId],
  );

  // Consumer-provided labels always win over the DialogHeader default.
  const hasConsumerName =
    props['aria-label'] != null || props['aria-labelledby'] != null;

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Callback ref on the <dialog>: sync the default aria-labelledby from the
  // DialogHeader title (if one rendered) in the same commit, with no second
  // render. Consumer aria-label/aria-labelledby win — when present we leave
  // the attribute to the {...safeProps} spread and never touch it here.
  const attachDialog = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      if (!node || hasConsumerName) {
        return;
      }
      const hasTitle = node.querySelector(`#${CSS.escape(titleId)}`) != null;
      if (hasTitle) {
        node.setAttribute('aria-labelledby', titleId);
      } else {
        node.removeAttribute('aria-labelledby');
      }
    },
    [titleId, hasConsumerName],
  );

  // Capture the element that was focused when the dialog opened,
  // for directional animation origin and focus restoration on close.
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // `isOpen` has gone false but the dialog is still on screen, playing its
  // exit animation. Derived during render rather than in an effect: the exit
  // style has to land in the same commit that drops `open`, or the dialog
  // blinks out for a frame before it starts animating (measured: one frame at
  // display:none, then the fade).
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setIsExiting(wasOpen);
  }

  // Derive dismissal behavior from purpose
  const allowEscape = purpose !== 'required';
  const allowBackdropClick = purpose === 'info';

  // Handle open/close state — skip for inline rendering
  useEffect(() => {
    if (isInline) {
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      // Capture the currently focused element as the trigger — used for
      // directional animation origin and focus restoration on close.
      triggerElementRef.current = document.activeElement as HTMLElement | null;

      // Set directional CSS custom properties before opening
      const trigger = triggerElementRef.current;
      if (trigger && trigger !== document.body) {
        const dir = getDialogDirection(trigger);
        dialog.style.setProperty('--dialog-dir-x', `${dir.x}px`);
        dialog.style.setProperty('--dialog-dir-y', `${dir.y}px`);
      } else {
        dialog.style.setProperty('--dialog-dir-x', '0px');
        dialog.style.setProperty('--dialog-dir-y', '16px');
      }

      if (!dialog.open) {
        dialog.showModal();
        // React's autoFocus calls .focus() during commit, before showModal()
        // makes the dialog visible, so the focus silently fails.
        // Focus the first element with data-autofocus inside the dialog.
        const autofocusTarget =
          dialog.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocusTarget) {
          autofocusTarget.focus();
        }
      }
    } else if (!dialog.open) {
      // Never opened, or already closed by the exit effect below.
      triggerElementRef.current?.focus();
      triggerElementRef.current = null;
    }
  }, [isOpen, isInline]);

  // Hold the open dialog while it animates out, then close. The hold is read
  // from the dialog only once `exiting` is on it — that is what makes it the
  // exit's duration and not the entrance's — so this is its own effect rather
  // than a branch of the one above.
  //
  // Focus goes back to the trigger after close(), never before: an open modal
  // makes the rest of the document inert, so focusing the trigger any earlier
  // silently fails.
  useEffect(() => {
    if (isInline || !isExiting) {
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (!dialog.open) {
      setIsExiting(false);
      return;
    }

    const finishClose = () => {
      setIsExiting(false);
      dialog.close();
      triggerElementRef.current?.focus();
      triggerElementRef.current = null;
    };

    const delay = resolveExitDelay(dialog);
    if (delay <= 0) {
      finishClose();
      return;
    }

    const timeout = setTimeout(finishClose, delay);
    return () => clearTimeout(timeout);
  }, [isExiting, isInline]);

  // Close the dialog if it unmounts mid-exit: the pending close() is cancelled
  // with the effect above, and leaving the element `open` would skip
  // showModal() on the next open (same failure MobileNav guards against).
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  // Lock body scroll while the dialog is up (iOS Safari workaround), including
  // its exit animation — unpinning the body early would scroll the page back
  // underneath a dialog that is still on screen.
  // Skip for inline rendering — no modal overlay to compensate for.
  useScrollLock((isOpen || isExiting) && !isInline);

  // Handle Escape key — skip for inline rendering
  useEffect(() => {
    if (isInline) {
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Ignore IME composition-cancel, and defer to any popover/menu layered
        // on top of this dialog so a single Escape closes only the top-most
        // layer (the popover's own focus trap handles it and stops propagation).
        if (isImeKeyEvent(event) || hasActiveFocusTrapEscape()) {
          return;
        }
        event.preventDefault();
        if (allowEscape) {
          onOpenChange(false);
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isInline, allowEscape, onOpenChange]);

  // Dev-time guardrail: an open modal should always have an accessible name.
  // The header-title check reads the DOM, so this stays in an effect; the ref
  // keeps it to one warning per component instance.
  const warnedUnnamedDialogRef = useRef(false);
  useEffect(() => {
    const hasHeaderTitle =
      dialogRef.current?.querySelector(`#${CSS.escape(titleId)}`) != null;
    if (
      isOpen &&
      !isInline &&
      !hasConsumerName &&
      !hasHeaderTitle &&
      !warnedUnnamedDialogRef.current
    ) {
      warnedUnnamedDialogRef.current = true;
      devWarn(
        'Dialog',
        'open dialog has no accessible name. Add a DialogHeader ' +
          'with a `title`, or pass `aria-label`/`aria-labelledby`.',
      );
    }
  }, [isOpen, isInline, hasConsumerName, titleId]);

  // Handle backdrop click — when the user clicks the ::backdrop pseudo-element,
  // the event target is the <dialog> element itself; clicks on child content
  // always target the child. This avoids false positives from native browser
  // popups (date pickers, selects, color pickers) that render outside the
  // dialog's bounding rect.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && allowBackdropClick) {
      onOpenChange(false);
    }
  };

  // Handle native cancel event (browser Escape handling)
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    // Defer to a popover/menu layered on top of this dialog; it will dismiss
    // itself on the same Escape press.
    if (hasActiveFocusTrapEscape()) {
      return;
    }
    if (allowEscape) {
      onOpenChange(false);
    }
  };

  // Shared inner content wrapper
  const innerContent = (
    <div
      {...stylex.props(
        styles.inner,
        ...container(
          useThemeDefault
            ? {
                useThemeDefault: 'dialog',
                maxHeight: isFullscreen
                  ? undefined
                  : typeof maxHeight === 'number'
                    ? `${maxHeight}px`
                    : maxHeight,
              }
            : {
                paddingInnerX: paddingToken,
                paddingInnerY: paddingToken,
                paddingOuterX: paddingToken,
                paddingOuterY: paddingToken,
                maxHeight: isFullscreen
                  ? undefined
                  : typeof maxHeight === 'number'
                    ? `${maxHeight}px`
                    : maxHeight,
              },
        ),
        !useThemeDefault &&
          effectivePadding !== 4 &&
          paddingStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingInlineVarStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingBlockStartVarStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingBlockEndVarStyles[effectivePadding],
      )}>
      <DialogContext value={dialogContextValue}>{children}</DialogContext>
    </div>
  );

  // Filter out native open to prevent InvalidStateError when accidentally passed
  const hasPosition = position != null && !isFullscreen;
  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  // --- Inline rendering path (for documentation previews) ---
  if (isInline) {
    if (!isOpen) {
      return null;
    }

    return (
      <div
        {...safeProps}
        {...mergeProps(
          themeProps('dialog', {variant}),
          stylex.props(
            styles.inlineWrapper,
            !isFullscreen && dynamicStyles.sizing(width, maxHeight),
            isFullscreen && styles.fullscreen,
            xstyle,
          ),
          className,
          style,
        )}
        data-testid={
          (props as Record<string, unknown>)['data-testid'] as
            string | undefined
        }>
        {innerContent}
      </div>
    );
  }

  // --- Standard modal rendering path ---

  return (
    <dialog
      ref={mergeRefs(ref, attachDialog)}
      {...safeProps}
      {...mergeProps(
        themeProps('dialog', {variant}),
        focusOutlineProps.focusVisible(
          styles.dialog,
          isOpen && styles.open,
          isExiting && styles.exiting,
          styles.backdrop,
          !isFullscreen && dynamicStyles.sizing(width, maxHeight),
          hasPosition &&
            (() => {
              const o = resolveDialogPositionOffsets(position);
              return dynamicStyles.position(
                o.top,
                o.insetInlineStart,
                o.insetInlineEnd,
                o.bottom,
              );
            })(),
          isFullscreen && styles.fullscreen,
          xstyle,
        ),
        className,
        style,
      )}
      onClick={handleClick}
      onCancel={handleCancel}
      aria-modal="true"
      // The default aria-labelledby (from a DialogHeader title) is set
      // imperatively in `attachDialog`; a consumer-provided aria-labelledby
      // flows through {...safeProps} above and wins.
      {...(purpose === 'required' ? {role: 'alertdialog'} : undefined)}>
      {innerContent}
    </dialog>
  );
}

Dialog.displayName = 'Dialog';
