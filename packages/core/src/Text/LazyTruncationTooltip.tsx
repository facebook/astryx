/**
 * @file LazyTruncationTooltip.tsx
 * @input Uses XDSTooltip with anchorRef for sibling-mode rendering
 * @output Default export: lazy-loadable tooltip for truncated text
 * @position Dynamic import target for XDSText and XDSHeading truncation tooltips
 *
 * This file is the code-split boundary for the tooltip/layer system.
 * It is loaded via React.lazy only when text is actually truncated,
 * keeping the ~12KB layer system out of the initial bundle.
 */

import type {RefObject} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTooltip} from '../Layer';
import type {LayerPlacement} from '../Layer';
import {truncationTooltipStyles} from './text.stylex';

interface LazyTruncationTooltipProps {
  /**
   * Ref to the text element that serves as the tooltip anchor
   */
  anchorRef: RefObject<HTMLElement>;

  /**
   * Full text content to display in the tooltip
   */
  content: string;

  /**
   * Tooltip placement relative to the anchor
   * @default 'above'
   */
  placement?: LayerPlacement;
}

/**
 * Lazy-loadable truncation tooltip component.
 *
 * Renders an XDSTooltip in sibling mode using `anchorRef` to attach
 * to an external text element. This component is the dynamic import
 * target for React.lazy, ensuring the layer system is only loaded
 * when text actually overflows.
 */
export default function LazyTruncationTooltip({
  anchorRef,
  content,
  placement = 'above',
}: LazyTruncationTooltipProps) {
  return (
    <XDSTooltip
      anchorRef={anchorRef}
      content={
        <span {...stylex.props(truncationTooltipStyles.content)}>
          {content}
        </span>
      }
      placement={placement}
    />
  );
}

LazyTruncationTooltip.displayName = 'LazyTruncationTooltip';
