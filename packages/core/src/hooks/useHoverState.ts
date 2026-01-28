/**
 * @file useHoverState.ts
 * @input Uses React useState, useCallback
 * @output Exports useHoverState hook
 * @position Utility hook for tracking hover state on elements
 *
 * SYNC: When modified, update this header
 */

import {useState, useCallback} from 'react';

export interface UseHoverStateResult {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * A hook for tracking hover state on an element.
 *
 * @example
 * ```tsx
 * const {isHovered, onMouseEnter, onMouseLeave} = useHoverState();
 * return (
 *   <div
 *     onMouseEnter={onMouseEnter}
 *     onMouseLeave={onMouseLeave}
 *     style={{backgroundColor: isHovered ? 'blue' : 'transparent'}}
 *   >
 *     Hover me
 *   </div>
 * );
 * ```
 */
export function useHoverState(): UseHoverStateResult {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
  };
}
