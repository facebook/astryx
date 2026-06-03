// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared layout shell for every page in the docs section.
 * Owns the section padding, content container width, title and description
 * treatment, and vertical spacing. Pages supply only their unique body via
 * `children`.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

const styles = stylex.create({
  container: {maxWidth: 1200, marginInline: 'auto'},
  prose: {maxWidth: 800},
});

export function DocPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8} xstyle={styles.container}>
        <XDSVStack gap={2}>
          <XDSText type="display-2">{title}</XDSText>
          {description ? (
            <XDSText type="body" color="secondary" xstyle={styles.prose}>
              {description}
            </XDSText>
          ) : null}
        </XDSVStack>
        {children}
      </XDSVStack>
    </XDSSection>
  );
}
