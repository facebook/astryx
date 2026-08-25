// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ReactNode} from 'react';

/** Toast status type. Controls color scheme. */
export type ToastType = 'info' | 'error';

/** Position for the toast stack relative to the viewport. */
export type ToastPosition = 'topEnd' | 'topStart' | 'bottomEnd' | 'bottomStart';

/** Behavior when a toast with the same uniqueID already exists. */
export type ToastCollisionBehavior = 'overwrite' | 'ignore';

/** Reason why a toast was dismissed. */
export type ToastDismissReason = 'auto' | 'manual';

/** Options for showing a toast. */
export interface ToastOptions {
  /** Primary message content. */
  body: ReactNode;
  /**
   * Toast type controlling color.
   * @default 'info'
   */
  type?: ToastType;
  /**
   * Whether the toast auto-dismisses.
   * Defaults to true for info, false for error.
   */
  isAutoHide?: boolean;
  /**
   * Duration in ms before auto-dismiss.
   * @default 5000
   */
  autoHideDuration?: number;
  /** Content rendered at the end of the toast (trailing slot). */
  endContent?: ReactNode;

  /** Unique identifier for deduplication. */
  uniqueID?: string;
  /**
   * Behavior when a toast with matching uniqueID already exists.
   * @default 'overwrite'
   */
  collisionBehavior?: ToastCollisionBehavior;
  /** Callback fired when the toast is removed. */
  onHide?: (reason: ToastDismissReason) => void;
}

/** Function to programmatically dismiss a toast. */
export type ToastDismissFn = () => void;

/**
 * What a `renderBody` function receives: one toast's content, plus the two
 * controls Astryx has already built for it.
 *
 * `dismissButton` is the point of the whole thing. Astryx renders the close —
 * a ghost icon `Button` carrying the translated `@astryx.toast.dismiss` label
 * — and hands it over as an element to place. So it stays a real Astryx
 * `Button`: themeable through `astryx-button` like every other, named in the
 * user's language, and impossible for a custom layout to forget or mislabel.
 * The layout is the consumer's; the control is not.
 */
export interface ToastBodyRenderProps {
  /** Primary message content, as passed to `showToast`. */
  body: ReactNode;
  /** Trailing content, as passed to `showToast`. Place it in your layout. */
  endContent?: ReactNode;
  /**
   * Astryx's dismiss control, ready to place. Render it somewhere — it is the
   * toast's only pointer affordance, and on an error toast (which does not
   * auto-hide) its only exit at all.
   */
  dismissButton: ReactNode;
  /** Resolved toast type — `'error'` also makes the live region assertive. */
  type: ToastType;
  /** Whether this toast will dismiss itself. */
  isAutoHide: boolean;
  /** Milliseconds until auto-dismiss, when `isAutoHide`. */
  autoHideDuration: number;
  /**
   * Dismisses this toast, as a manual dismissal — the same thing
   * `dismissButton` does. For a layout whose own control dismisses too, e.g.
   * an Undo that closes the toast after undoing.
   */
  dismiss: ToastDismissFn;
}

/**
 * Renders the content of every toast inside Astryx's card — see
 * `ToastViewport`'s `renderBody`.
 */
export type ToastBodyRenderFn = (toast: ToastBodyRenderProps) => ReactNode;

/** Function returned by useToast to show toasts. */
export type ShowToastFn = (options: ToastOptions) => ToastDismissFn;

/** Internal toast state with ID and metadata. */
export interface ToastEntry {
  id: string;
  options: ToastOptions;
  createdAt: number;
}
