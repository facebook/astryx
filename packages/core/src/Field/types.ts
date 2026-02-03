/**
 * @file types.ts
 * @input None
 * @output Exports shared input component types
 * @position Shared types used across input components
 *
 * SYNC: When adding new shared types, update this file
 */

/**
 * Status type for input validation states.
 */
export type XDSInputStatusType = 'warning' | 'error' | 'success';

/**
 * Status indicator for input components.
 * Used by TextInput, TextArea, DatePicker, TimePicker, etc.
 */
export interface XDSInputStatus {
  /**
   * The type of status to display.
   * - 'error': Invalid input, prevents form submission
   * - 'warning': Caution, but allows submission
   * - 'success': Valid input confirmation
   */
  type: XDSInputStatusType;

  /**
   * Optional message to display below the input.
   * When provided, shows a colored message box.
   */
  message?: string;
}

/**
 * Standard size options for input components.
 */
export type XDSInputSize = 'sm' | 'md';
