import type {ReactNode} from 'react';

/** Toast status type. Controls icon and color scheme. */
export type XDSToastType = 'info' | 'warning' | 'error' | 'success';

/** Position for the toast stack relative to the viewport. */
export type XDSToastPosition =
  | 'topEnd'
  | 'topStart'
  | 'bottomEnd'
  | 'bottomStart';

/** Behavior when a toast with the same uniqueID already exists. */
export type XDSToastCollisionBehavior = 'overwrite' | 'ignore';

/** Reason why a toast was dismissed. */
export type XDSToastDismissReason = 'auto' | 'manual';

/** Options for showing a toast. */
export interface XDSToastOptions {
  /** Primary message content. Keep it short — one line is ideal. */
  title: ReactNode;
  /** Optional secondary content area. */
  body?: ReactNode;
  /**
   * Toast type controlling icon and color.
   * @default 'info'
   */
  type?: XDSToastType;
  /**
   * Whether the toast auto-dismisses.
   * Defaults to true for info/warning/success, false for error.
   */
  isAutoHide?: boolean;
  /**
   * Duration in ms before auto-dismiss.
   * @default 5000
   */
  autoHideDuration?: number;
  /** Content rendered at the end of the toast (trailing slot). */
  endContent?: ReactNode;
  /** Override the default icon for this toast type. */
  icon?: ReactNode;
  /** Unique identifier for deduplication. */
  uniqueID?: string;
  /**
   * Behavior when a toast with matching uniqueID already exists.
   * @default 'overwrite'
   */
  collisionBehavior?: XDSToastCollisionBehavior;
  /** Callback fired when the toast is removed. */
  onHide?: (reason: XDSToastDismissReason) => void;
}

/** Function to programmatically dismiss a toast. */
export type XDSToastDismissFn = () => void;

/** Function returned by useXDSToast to show toasts. */
export type XDSShowToastFn = (options: XDSToastOptions) => XDSToastDismissFn;

/** Internal toast state with ID and metadata. */
export interface XDSToastEntry {
  id: string;
  options: XDSToastOptions;
  createdAt: number;
}
