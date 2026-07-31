// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useDevWarning.ts
 * @input A component name, a message, and a boolean condition
 * @output Fires a dev-only `Component: message` warning once per mount
 * @position Core hook; the render-safe way to warn the builder from a component
 *
 * The right way to surface a dev guardrail from inside a component. A naive
 * `if (condition) console.warn(...)` in the render body repeats on every
 * render, and reaching for `useState` to gate it adds needless state and
 * re-renders. This hook uses a ref + effect: the warning fires once per mount
 * when the condition holds, never during render, and never triggers a
 * re-render. Messages use the standardized `Component: message` format.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/utils/devWarning.ts (the imperative counterpart)
 */

import {useEffect, useRef} from 'react';
import {devWarn} from '../utils/devWarning';

/**
 * Fire a dev-only warning once per mount while `condition` is true.
 *
 * @param component - Component or hook name (message prefix)
 * @param message - What went wrong and how to fix it
 * @param condition - Whether to warn; defaults to `true`
 *
 * @example
 * ```
 * useDevWarning(
 *   'Field',
 *   'isOptional and isRequired are mutually exclusive. isOptional takes precedence.',
 *   isOptional && isRequired,
 * );
 * ```
 */
export function useDevWarning(
  component: string,
  message: string,
  condition: boolean = true,
): void {
  const hasWarnedRef = useRef(false);
  useEffect(() => {
    if (condition && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      devWarn(component, message);
    }
  }, [component, message, condition]);
}
