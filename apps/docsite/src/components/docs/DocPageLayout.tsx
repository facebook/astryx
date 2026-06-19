// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared layout shell for every page in the docs section.
 * Owns the section padding, content container width, title and description
 * treatment, and vertical spacing. Pages supply only their unique body via
 * `children`.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Divider} from '@xds/core/Divider';
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
    <Section maxWidth={800} padding={6} xstyle={styles.section}>
      <VStack gap={10}>
        <VStack gap={4}>
          <Heading level={1} type="display-1">
            {title}
          </Heading>
          {description ? (
            <Text type="large" weight="normal" color="secondary">
              {description}
            </Text>
          ) : null}
          <Divider />
        </VStack>
        {children}
      </VStack>
    </Section>
  );
}
