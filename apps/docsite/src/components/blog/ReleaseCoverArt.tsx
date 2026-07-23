// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ReleaseCoverArt.tsx
 * Generated cover for release posts: the version in the Astryx brand blue on a
 * soft pastel-blue field, with the Astryx mark as the separator between
 * version segments and the package name beneath. Renders inline (not <img>).
 *
 * @input  version (e.g. "0.1.3"), packageName (defaults to @astryxdesign/core)
 * @output A decorative 16:9 cover
 * @position Used by BlogCard/BlogArticle when a post title carries a version.
 */

import {Fragment} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';

// Astryx mark (40x40 viewBox), mirrored from BlogCoverArt.
const MARK_PATH =
  'M11.2002 0C14.7347 0.000105757 17.6 2.8654 17.6001 6.3999V11.2002C17.6002 12.3047 18.4956 13.2002 19.6001 13.2002H20.3999C21.5044 13.2002 22.3998 12.3047 22.3999 11.2002V6.3999C22.4 2.8654 25.2653 0.000106275 28.7998 0H37.6001C38.9255 5.15369e-05 39.9999 1.07451 40 2.3999V11.2002C39.9999 14.7347 37.1346 17.6 33.6001 17.6001H28.7998C27.6953 17.6002 26.7998 18.4956 26.7998 19.6001V20.3999C26.7998 21.5044 27.6953 22.3998 28.7998 22.3999H33.6001C37.1346 22.4 39.9999 25.2653 40 28.7998V37.6001C40 38.9255 38.9255 39.9999 37.6001 40H28.7998C25.2653 39.9999 22.3999 37.1346 22.3999 33.6001V28.7998C22.3998 27.6953 21.5044 26.7998 20.3999 26.7998H19.6001C18.4956 26.7998 17.6002 27.6953 17.6001 28.7998V33.6001C17.6001 37.1346 14.7347 39.9999 11.2002 40H2.39991C1.07449 39.9999 3.97232e-05 38.9255 0 37.6001V28.7998C0.000118127 25.2653 2.86539 22.4 6.3999 22.3999H11.2002C12.3047 22.3998 13.2002 21.5044 13.2002 20.3999V19.6001C13.2002 18.4956 12.3047 17.6002 11.2002 17.6001H6.3999C2.86538 17.6 9.39063e-05 14.7347 0 11.2002V2.3999C6.46793e-05 1.07451 1.07451 5.28641e-05 2.39991 0H11.2002Z';

const DEFAULT_PACKAGE = '@astryxdesign/core';

// Same soft pastel blue as the landing feature cards.
const FIELD_BLUE = 'var(--astryx-marketing-feature-card-bg)';

const styles = stylex.create({
  root: {
    width: '100%',
    height: '100%',
    // Query container so the version + marks scale (in cqw) to fill any size.
    containerType: 'size',
    backgroundColor: FIELD_BLUE,
    // Pin light-dark() tokens to their light values against the fixed field.
    colorScheme: 'light',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
  },
  // Carries the vertical gap. Must be a child of root, not root itself: an
  // element isn't its own container, so `gap: cqw` on root resolves against the
  // viewport instead of the cover width and wouldn't scale in a small preview.
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.8cqw',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.1cqw',
  },
  version: {
    color: 'var(--color-brand)',
    fontSize: '14.7cqw',
    lineHeight: 1,
  },
  handle: {
    fontSize: '2.3cqw',
  },
  mark: {
    width: '3.3cqw',
    height: '3.3cqw',
    flexShrink: 0,
    display: 'block',
    fill: 'var(--color-brand)',
    // Sit low so the mark reads as the "dot" between version segments.
    transform: 'translateY(2.1cqw)',
  },
});

export interface ReleaseCoverArtProps {
  /** Semantic version without the leading `v` (e.g. "0.1.3"). */
  version: string;
  /** The package label rendered beneath the version. */
  packageName?: string;
}

export function ReleaseCoverArt({
  version,
  packageName = DEFAULT_PACKAGE,
}: ReleaseCoverArtProps) {
  const segments = version.split('.');

  return (
    <div {...stylex.props(styles.root)} role="presentation" aria-hidden="true">
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.row)}>
          {segments.map((segment, i) => (
            <Fragment key={i}>
              {i > 0 ? (
                <svg {...stylex.props(styles.mark)} viewBox="0 0 40 40">
                  <path d={MARK_PATH} />
                </svg>
              ) : null}
              <Text type="code" weight="semibold" xstyle={styles.version}>
                {segment}
              </Text>
            </Fragment>
          ))}
        </div>
        <Text type="code" color="secondary" as="div" xstyle={styles.handle}>
          {packageName}
        </Text>
      </div>
    </div>
  );
}
