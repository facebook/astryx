// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AuthorByline.tsx
 * Blog byline: author avatars + names, plus publish/updated date and reading
 * time.
 */

import * as stylex from '@stylexjs/stylex';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Text} from '@astryxdesign/core/Text';
import {HStack} from '@astryxdesign/core/Layout';
import {Divider} from '@astryxdesign/core/Divider';
import {resolveAuthor} from '../../content/blog/authors';

export function formatDate(iso: string): string {
  // Parse as UTC to avoid off-by-one from local timezones.
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const styles = stylex.create({
  divider: {
    height: '0.75em',
  },
});

export interface AuthorBylineProps {
  authors: string[];
  date: string;
  updatedAt?: string | null;
  readingTimeMinutes?: number;
  variant?: 'compact' | 'full';
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
  const avatarSize = variant === 'full' ? 'small' : 'tiny';
  const textType = variant === 'full' ? 'body' : 'supporting';
  const names = resolved.map(a => a.name).join(', ');

  return (
    <HStack
      gap={variant === 'full' ? 4 : 2}
      align="center"
      className={className}>
      {resolved.length > 0 ? (
        <>
          <AvatarGroup size={avatarSize}>
            {resolved.map(author => (
              <Avatar key={author.key} src={author.avatar} name={author.name} />
            ))}
          </AvatarGroup>
          <Text type={textType} color="secondary">
            {names}
          </Text>
          <Divider orientation="vertical" xstyle={styles.divider} />
        </>
      ) : null}
      <Text type={textType} color="secondary">
        {formatDate(date)}
      </Text>
      {variant === 'full' && updatedAt ? (
        <>
          <Divider orientation="vertical" xstyle={styles.divider} />
          <Text type={textType} color="secondary">
            Updated {formatDate(updatedAt)}
          </Text>
        </>
      ) : null}
      {readingTimeMinutes ? (
        <>
          <Divider orientation="vertical" xstyle={styles.divider} />
          <Text type={textType} color="secondary">
            {readingTimeMinutes} min read
          </Text>
        </>
      ) : null}
    </HStack>
  );
}
