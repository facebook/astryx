// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CommentParts.tsx
 * @input Uses React, StyleX, theme colors, Banner, Blockquote, Button, Link, Text
 * @output Exports the small presentational parts owned by CommentComposer
 * @position Internal building blocks for the Lab CommentComposer; later
 *   Comments-family components extend this module
 */

import type {Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Banner} from '@astryxdesign/core/Banner';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {CommentHighlightColor} from './types';

export const partStyles = stylex.create({
  noWrap: {whiteSpace: 'nowrap'},
  quoteText: {fontStyle: 'italic'},
  fullWidth: {width: '100%'},
});

const highlightRules = stylex.create({
  blue: {borderInlineStartColor: colorVars['--color-border-blue']},
  cyan: {borderInlineStartColor: colorVars['--color-border-cyan']},
  gray: {borderInlineStartColor: colorVars['--color-border-gray']},
  green: {borderInlineStartColor: colorVars['--color-border-green']},
  orange: {borderInlineStartColor: colorVars['--color-border-orange']},
  pink: {borderInlineStartColor: colorVars['--color-border-pink']},
  purple: {borderInlineStartColor: colorVars['--color-border-purple']},
  red: {borderInlineStartColor: colorVars['--color-border-red']},
  teal: {borderInlineStartColor: colorVars['--color-border-teal']},
  yellow: {borderInlineStartColor: colorVars['--color-border-yellow']},
});

/** A failed action as an error Banner with its one recovery action. */
export type ErrorBannerContent = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isActionDisabled?: boolean;
};

/** An inline failure announced when its error Banner mounts. */
export function ErrorBanner({
  actionRef,
  content,
  onBeforeAction,
  ...dataProps
}: {
  actionRef?: Ref<HTMLButtonElement>;
  content: ErrorBannerContent;
  onBeforeAction?: () => void;
  [dataAttribute: `data-${string}`]: string | undefined;
}) {
  const {actionLabel, description, isActionDisabled, onAction, title} = content;
  return (
    <Banner
      status="error"
      role="alert"
      container="card"
      title={title}
      description={description}
      xstyle={partStyles.fullWidth}
      endContent={
        actionLabel != null && onAction != null ? (
          <Button
            ref={actionRef}
            label={actionLabel}
            variant="ghost"
            size="sm"
            isDisabled={isActionDisabled}
            onClick={() => {
              onBeforeAction?.();
              onAction();
            }}
          />
        ) : undefined
      }
      {...dataProps}
    />
  );
}

export function MetadataSeparator({
  type = 'body',
}: {
  type?: 'body' | 'supporting';
}) {
  return (
    <Text as="span" type={type} color="secondary" aria-hidden="true">
      ·
    </Text>
  );
}

/** A secondary text link that performs a compact composer action. */
export function MetadataActionLink({
  accessibleLabel,
  actionRole,
  isDisabled,
  label,
  onClick,
  textType = 'supporting',
}: {
  accessibleLabel?: string;
  actionRole?: 'history';
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
  textType?: 'body' | 'supporting';
}) {
  return (
    <Link
      label={accessibleLabel ?? label}
      type={textType}
      color="secondary"
      xstyle={partStyles.noWrap}
      data-metadata-action={actionRole}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      onClick={event => {
        event.preventDefault();
        if (isDisabled !== true) {
          onClick();
        }
      }}>
      {label}
    </Link>
  );
}

/** A quoted passage in Markdown's blockquote style, clamped to two lines. */
export function QuotedPassage({
  quote,
  highlightColor,
}: {
  quote: string;
  highlightColor?: CommentHighlightColor;
}) {
  return (
    <Blockquote
      xstyle={
        highlightColor != null ? highlightRules[highlightColor] : undefined
      }
      data-quote-rule={highlightColor != null ? 'highlight' : 'neutral'}
      data-highlight-color={highlightColor}>
      <Text
        type="body"
        color="inherit"
        maxLines={2}
        xstyle={partStyles.quoteText}>
        {quote}
      </Text>
    </Blockquote>
  );
}
