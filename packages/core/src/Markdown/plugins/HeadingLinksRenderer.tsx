// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeadingLinksRenderer.tsx
 * @input A built-in semantic heading and its module-owned identity projection
 * @output Inline heading-permalink copy composition
 * @position Internal renderer owned by module:Markdown/headingLinks
 */

import {useCallback} from 'react';
import type {MouseEvent, ReactElement} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../../Button/Button';
import {Icon} from '../../Icon';
import {useClipboard} from '../../hooks/useClipboard';
import {useContainerReveal} from '../../hooks/useContainerReveal';
import {useTranslator} from '../../i18n';
import {colorVars, sizeVars, spacingVars} from '../../theme/tokens.stylex';
import {mergeProps} from '../../utils';

const COPY_FEEDBACK_MS = 1500;
const TOUCH_TARGET = '44px';

const ALIGN_MARGIN = {
  start: '0',
  center: 'auto',
} as const;

const dynamicStyles = stylex.create({
  proseWidth: (maxWidth: string) => ({maxWidth}),
  proseAlign: (marginInline: string) => ({marginInline}),
});

const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'baseline',
    minWidth: 0,
    maxWidth: '100%',
  },
  heading: {
    flex: '0 1 auto',
    minWidth: 0,
  },
  copyButton: {
    flexShrink: 0,
    inlineSize: sizeVars['--size-element-sm'],
    minInlineSize: {
      default: null,
      '@media (pointer: coarse)': TOUCH_TARGET,
    },
    minBlockSize: {
      default: null,
      '@media (pointer: coarse)': TOUCH_TARGET,
    },
    marginInlineStart: spacingVars['--spacing-1'],
    paddingBlock: 0,
    paddingInline: 0,
    color: colorVars['--color-text-secondary'],
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
  },
  glyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    inlineSize: '1em',
    blockSize: '1em',
  },
});

/** @internal Applied only while this module owns the built-in heading row. */
export const headingLinksHeadingStyle = styles.heading;

interface HeadingLinksRendererProps {
  readonly children: ReactElement;
  readonly headingId: string;
  readonly headingLabel: string;
  readonly permalinkUrl: string;
  readonly contentWidth: string | null;
  readonly contentAlign: 'start' | 'center';
}

function isUnmodifiedPrimaryActivation(
  event: MouseEvent<HTMLButtonElement>,
): boolean {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

/** @internal Portable renderer composed by Markdown for built-in headings only. */
export function HeadingLinksRenderer({
  children,
  headingId,
  headingLabel,
  permalinkUrl,
  contentWidth,
  contentAlign,
}: HeadingLinksRendererProps): ReactElement {
  const t = useTranslator();
  const copiedLabel = t('@astryx.markdownHeadingLinks.copied');
  const copyLabel = t('@astryx.markdownHeadingLinks.copy', {
    heading: headingLabel || headingId,
  });
  const {copy, isCopied} = useClipboard({
    announce: copiedLabel,
    resetAfterMs: COPY_FEEDBACK_MS,
  });
  const {getContainerProps, getContentRevealProps} = useContainerReveal();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!isUnmodifiedPrimaryActivation(event)) {
        return;
      }
      // This is deliberately an honest copy button rather than an anchor: the
      // heading remains an incoming fragment target, while activating the #
      // never mutates location, scrolls, or implies open-in-new-tab semantics.
      void copy(new URL(permalinkUrl, window.location.href).href);
    },
    [copy, permalinkUrl],
  );

  return (
    <div
      {...mergeProps(
        getContainerProps(),
        stylex.props(
          styles.row,
          contentWidth != null ? dynamicStyles.proseWidth(contentWidth) : null,
          contentAlign !== 'start'
            ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign])
            : null,
        ),
      )}>
      {children}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        label={isCopied ? copiedLabel : copyLabel}
        onClick={handleClick}
        xstyle={styles.copyButton}
        {...getContentRevealProps({isLayoutPreserved: true})}>
        <span aria-hidden="true" {...stylex.props(styles.glyph)}>
          {isCopied ? <Icon icon="check" size="sm" color="inherit" /> : '#'}
        </span>
      </Button>
    </div>
  );
}
