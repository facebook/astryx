// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared layout shell for every page in the docs section.
 * Owns the section padding, content container width, title and description
 * treatment, and vertical spacing. Pages supply only their unique body via
 * `children`.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    paddingBottom: `calc(${spacingVars['--spacing-12']} * 2)`,
  },
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
    <XDSSection maxWidth={800} padding={6} xstyle={styles.section}>
      <XDSVStack gap={10}>
        <XDSVStack gap={4}>
          <XDSHeading level={1} type="display-1">
            {title}
          </XDSHeading>
          {description ? (
            <XDSText type="large" weight="normal" color="secondary">
              {description}
            </XDSText>
          ) : null}
          <XDSDivider />
        </XDSVStack>
        {children}
      </XDSVStack>
    </XDSSection>
  );
}
