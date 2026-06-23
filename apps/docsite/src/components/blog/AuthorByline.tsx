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
import {Avatar} from '@xds/core/Avatar';
import {Text} from '@xds/core/Text';
import {HStack} from '@xds/core/Layout';
import {Divider} from '@xds/core/Divider';
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
  divider: {
    height: '0.75em',
  },
});

export interface AuthorBylineProps {
  authors: string[];
  date: string;
  updatedAt?: string | null;
  readingTimeMinutes?: number;
  /** 'compact' for cards, 'full' for article headers. */
  variant?: 'compact' | 'full';
  /** Optional class on the root row (e.g. for parent-driven hover styling). */
  className?: string;
}

export function AuthorByline({
  authors,
  date,
  updatedAt,
  readingTimeMinutes,
  variant = 'compact',
  className,
}: AuthorBylineProps) {
  const resolved = authors.map(resolveAuthor);
  const names = resolved.map(a => a.name).join(', ');

  return (
    <HStack gap={2} align="center" className={className}>
      <HStack gap={0} align="center">
        {resolved.map(author => (
          <Avatar
            key={author.key}
            src={author.avatar}
            name={author.name}
            size="tiny"
          />
        ))}
      </HStack>
      <HStack gap={2} align="center">
        <Text type="supporting" color="secondary">
          {names}
        </Text>
        <Divider orientation="vertical" xstyle={styles.divider} />
        <Text type="supporting" color="secondary">
          {formatDate(date)}
        </Text>
        {variant === 'full' && updatedAt ? (
          <>
            <Divider orientation="vertical" xstyle={styles.divider} />
            <Text type="supporting" color="secondary">
              Updated {formatDate(updatedAt)}
            </Text>
          </>
        ) : null}
        {readingTimeMinutes ? (
          <>
            <Divider orientation="vertical" xstyle={styles.divider} />
            <Text type="supporting" color="secondary">
              {readingTimeMinutes} min read
            </Text>
          </>
        ) : null}
      </HStack>
    </HStack>
  );
}
