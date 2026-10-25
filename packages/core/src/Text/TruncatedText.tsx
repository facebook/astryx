// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TruncatedText.tsx
 * @input Uses React hooks, useTruncation, useMergedRefs, lazy Tooltip
 * @output Exports TruncatedText, the client part of Text and Heading that
 *   measures overflow and shows the full text in a tooltip
 * @position Client island; rendered by Text.tsx and Heading.tsx only when
 *   `maxLines > 0` with the truncation tooltip on. Its server output is the
 *   same element Text/Heading render statically.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 * - /packages/core/src/serverSafeComponents.test.ts (CLIENT_ISLANDS)
 */

import {
  lazy,
  Suspense,
  useRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {truncationTooltipStyles} from './text.stylex';
import {useTruncation} from './useTruncation';
import type {LayerPlacement} from '../Layer';
import {useMergedRefs} from '../hooks/useMergedRefs';

const LazyTooltip = lazy(async () =>
  import('../Tooltip/Tooltip').then(mod => ({default: mod.Tooltip})),
);

export interface TruncatedTextProps {
  /** The element Text or Heading renders. */
  as: ElementType;
  /** The element's resolved props (classes, style, ARIA, the caller's rest). */
  elementProps: Record<string, unknown>;
  /** Lines before the text is clipped; always > 0 here. */
  maxLines: number;
  /** Where the full-text tooltip opens. */
  tooltipPlacement: LayerPlacement;
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
}

/**
 * Renders Text's or Heading's element and, once the text overflows, a tooltip
 * with the full text.
 */
export function TruncatedText({
  as: Component,
  elementProps,
  maxLines,
  tooltipPlacement,
  ref,
  children,
}: TruncatedTextProps) {
  const truncation = useTruncation({maxLines});
  // The tooltip's anchor.
  const textRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRefs(ref, truncation.ref, textRef);
  return (
    <>
      <Component ref={mergedRef} {...elementProps}>
        {children}
      </Component>
      {truncation.isTruncated && (
        <Suspense fallback={null}>
          <LazyTooltip
            anchorRef={textRef}
            content={
              <span {...stylex.props(truncationTooltipStyles.content)}>
                {truncation.fullText}
              </span>
            }
            placement={tooltipPlacement}
          />
        </Suspense>
      )}
    </>
  );
}

TruncatedText.displayName = 'TruncatedText';
