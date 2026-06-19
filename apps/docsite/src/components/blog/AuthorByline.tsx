// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AuthorByline.tsx
 *
 * Renders one or more resolved authors with avatars, plus optional publish/
 * updated dates and reading time. Used on blog cards (compact) and at the top of
 * article pages (full).
 *
 * @input  author keys, date, optional updatedAt, optional readingTimeMinutes
 * @output A horizontal byline row
 * @position Used by BlogCard and the article header
 */

import * as stylex from '@stylexjs/stylex';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSText} from '@xds/core/Text';
import {XDSHStack} from '@xds/core/Layout';
import {resolveAuthor} from '../../content/blog/authors';

export function formatDate(iso: string): string {
  // Parse as UTC to avoid off-by-one from local timezones.
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const styles = stylex.create({
  names: {
    display: 'inline',
  },
  dot: {
    opacity: 0.5,
  },
});

export interface AuthorBylineProps {
  authors: string[];
  date: string;
  updatedAt?: string | null;
  readingTimeMinutes?: number;
  /** 'compact' for cards, 'full' for article headers. */
  variant?: 'compact' | 'full';
}

export function AuthorByline({
  authors,
  date,
  updatedAt,
  readingTimeMinutes,
  variant = 'compact',
}: AuthorBylineProps) {
  const resolved = authors.map(resolveAuthor);
  const avatarSize = variant === 'full' ? 'small' : 'tiny';
  const names = resolved.map(a => a.name).join(', ');

  return (
    <XDSHStack gap={2} align="center">
      <XDSHStack gap={0} align="center">
        {resolved.map(author => (
          <XDSAvatar
            key={author.key}
            src={author.avatar}
            name={author.name}
            size={avatarSize}
          />
        ))}
      </XDSHStack>
      <XDSHStack gap={1} align="center">
        <XDSText type="supporting" color="secondary">
          {names}
        </XDSText>
        <XDSText type="supporting" color="secondary" xstyle={styles.dot}>
          ·
        </XDSText>
        <XDSText type="supporting" color="secondary">
          {formatDate(date)}
        </XDSText>
        {variant === 'full' && updatedAt ? (
          <>
            <XDSText type="supporting" color="secondary" xstyle={styles.dot}>
              ·
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Updated {formatDate(updatedAt)}
            </XDSText>
          </>
        ) : null}
        {readingTimeMinutes ? (
          <>
            <XDSText type="supporting" color="secondary" xstyle={styles.dot}>
              ·
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {readingTimeMinutes} min read
            </XDSText>
          </>
        ) : null}
      </XDSHStack>
    </XDSHStack>
  );
}
