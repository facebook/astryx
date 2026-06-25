// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * A section heading that is linkable by anchor. Renders a `Heading` with a
 * stable `id` plus a copy-link affordance that appears on hover/focus and
 * copies the deep link (`<page-url>#<id>`) to the clipboard.
 *
 * Used for docs section headings so readers can link directly to a section
 * (see issue: "Add section header link copy to docsite").
 */

import {useCallback, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Link2, Check} from 'lucide-react';
import {
  Heading,
  type HeadingLevel,
  type HeadingType,
} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  spacingVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {anchorHeadingScope} from './anchorHeading.markers.stylex';

const styles = stylex.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    // Clear the sticky app header (and, on mobile, the sticky on-this-page
    // selector via --docs-anchor-offset) when navigated to via the anchor.
    scrollMarginTop:
      'calc(var(--appshell-header-height, 0px) + var(--docs-anchor-offset, 0px) + 16px)',
  },
  reveal: {
    display: 'inline-flex',
    flexShrink: 0,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    opacity: {
      default: 0,
      // Coarse pointers can't hover; keep the affordance visible there.
      '@media (hover: none)': 1,
      [stylex.when.ancestor(':hover', anchorHeadingScope)]: 1,
      [stylex.when.ancestor(':focus-within', anchorHeadingScope)]: 1,
    },
  },
});

export interface AnchorHeadingProps {
  /** Anchor id assigned to the heading row and used to build the deep link. */
  id: string;
  level: HeadingLevel;
  type?: HeadingType;
  children: React.ReactNode;
}

export function AnchorHeading({id, level, type, children}: AnchorHeadingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, '', `#${id}`);
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [id]);

  return (
    <div id={id} {...stylex.props(styles.row, anchorHeadingScope)}>
      <Heading level={level} type={type}>
        {children}
      </Heading>
      <span {...stylex.props(styles.reveal)}>
        <IconButton
          size="sm"
          variant="ghost"
          label={`Copy link to "${typeof children === 'string' ? children : 'section'}"`}
          tooltip={copied ? 'Copied' : 'Copy link'}
          icon={<Icon icon={copied ? Check : Link2} size="sm" />}
          onClick={handleCopy}
        />
      </span>
    </div>
  );
}
