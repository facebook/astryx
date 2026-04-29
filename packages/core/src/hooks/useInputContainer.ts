'use client';

/**
 * @file useInputContainer.ts
 * @input Container ref, input ref
 * @output onClick and onMouseUp handlers for the input container wrapper
 * @position Hook for input wrapper containers that delegate focus to the inner input/textarea
 *
 * Uses useClickableContainer to safely handle nested interactive elements
 * (clear buttons, calendar toggles, etc.) while focusing the input when
 * clicking non-interactive areas (icons, padding, status indicators).
 */

import {useCallback, type RefObject} from 'react';
import {useClickableContainer} from './useClickableContainer';

/**
 * Input types that should receive `.focus()` when the container is clicked.
 * Other input types (e.g. checkbox, radio, file) use `.click()` instead.
 */
const FOCUS_INPUT_TYPES = new Set([
  'text',
  'password',
  'email',
  'number',
  'search',
  'tel',
  'url',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

export interface UseInputContainerOptions {
  /** Ref to the outer container/wrapper element */
  containerRef: RefObject<HTMLElement | null>;
  /** Ref to the inner input or textarea element */
  inputRef: RefObject<
    HTMLInputElement | HTMLTextAreaElement | HTMLElement | null
  >;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Hook that makes an input container wrapper clickable, delegating focus
 * to the inner input/textarea when the user clicks non-interactive areas
 * (icons, padding, status indicators).
 *
 * Nested interactive elements (clear buttons, links) are handled safely
 * via useClickableContainer — clicking them does NOT steal focus.
 *
 * @compositionHint Use inside input wrapper components (XDSTextInput,
 * XDSNumberInput, XDSTimeInput, XDSTextArea, etc.).
 *
 * @example
 * ```
 * const containerRef = useRef<HTMLDivElement>(null);
 * const inputRef = useRef<HTMLInputElement>(null);
 * const { onClick, onMouseUp } = useInputContainer({
 *   containerRef,
 *   inputRef,
 * });
 * return (
 *   <div ref={containerRef} onClick={onClick} onMouseUp={onMouseUp}>
 *     <XDSIcon icon="search" />
 *     <input ref={inputRef} />
 *   </div>
 * );
 * ```
 */
export function useInputContainer({
  containerRef,
  inputRef,
  disabled = false,
}: UseInputContainerOptions) {
  const onClick = useCallback(() => {
    const input = inputRef.current;
    if (input == null) return;
    if (
      input instanceof HTMLInputElement &&
      FOCUS_INPUT_TYPES.has(input.type)
    ) {
      input.focus();
    } else if (input instanceof HTMLTextAreaElement) {
      input.focus();
    } else if (input instanceof HTMLElement) {
      input.click();
    } else if ('focus' in input) {
      (input as unknown as {focus: () => void}).focus();
    }
  }, [inputRef]);

  return useClickableContainer({
    containerRef,
    interactiveRef: inputRef,
    onClick,
    disabled,
  });
}
