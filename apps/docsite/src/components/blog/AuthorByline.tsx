// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AuthorByline.tsx
 * Blog byline: publish/updated date and reading time.
 */

import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {HStack} from '@astryxdesign/core/Layout';
import {Divider} from '@astryxdesign/core/Divider';

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
  divider: {
    height: '0.75em',
  },
});

export interface AuthorBylineProps {
  date: string;
  updatedAt?: string | null;
  readingTimeMinutes?: number;
  variant?: 'compact' | 'full';
  className?: string;
}

export function AuthorByline({
  date,
  updatedAt,
  readingTimeMinutes,
  variant = 'compact',
  className,
}: AuthorBylineProps) {
  return (
    <HStack gap={2} align="center" className={className}>
      <HStack gap={2} align="center">
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
