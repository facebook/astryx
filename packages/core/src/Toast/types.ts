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
 * What a `renderToast` function receives — one toast's content plus the
 * controls a surface needs to be complete.
 *
 * `dismiss` is the reason this is a render function rather than a slot: the
 * dismiss control has to be inside the surface, and the surface is built
 * before `showToast` has returned anything to close it with.
 */
export interface ToastRenderProps {
  /** Primary message content, as passed to `showToast`. */
  body: ReactNode;
  /** Trailing content, as passed to `showToast`. Place it in your surface. */
  endContent?: ReactNode;
  /** Resolved toast type — `'error'` also makes the live region assertive. */
  type: ToastType;
  /** Whether this toast will dismiss itself. */
  isAutoHide: boolean;
  /** Milliseconds until auto-dismiss, when `isAutoHide`. */
  autoHideDuration: number;
  /** The toast's `uniqueID`, when one was given. */
  uniqueID?: string;
  /** Removes this toast, as a manual dismissal. */
  dismiss: ToastDismissFn;
}

/**
 * Renders the entire visible surface of every toast, replacing Astryx's own
 * card — see `ToastViewport`'s `renderToast`.
 */
export type ToastRenderFn = (toast: ToastRenderProps) => ReactNode;

/** Function returned by useToast to show toasts. */
export type ShowToastFn = (options: ToastOptions) => ToastDismissFn;

/** Internal toast state with ID and metadata. */
export interface ToastEntry {
  id: string;
  options: ToastOptions;
  createdAt: number;
}
