// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared layout shell for every page in the docs section.
 * Owns the section padding, content container width, title and description
 * treatment, and vertical spacing. Pages supply only their unique body via
 * `children`.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Divider} from '@astryxdesign/core/Divider';
import {typeScaleVars} from '@astryxdesign/core/theme/tokens.stylex';
import {layout} from '../../layout.stylex';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    // Article body text reads larger and airier than the app default
    // (body = 14px / 1.43). Re-assigning the body size/leading tokens here
    // scopes the change to body-typed Text *inside* an article only: the
    // title (display-1) and subtitle (large) use different tokens, and the
    // sidebar/top-nav live in a different subtree, so nothing else shifts.
    //
    // Leading follows the type scale's convention (unitless ratio = a
    // 4px-grid-snapped line box ÷ font size, per expandTypeScale's
    // computeLeading). The grid-snapped value closest to the requested ~1.7
    // at 16px is 28px ÷ 16px = 1.75.
    [typeScaleVars['--text-body-size']]: '1rem', // 16px
    [typeScaleVars['--text-body-leading']]: '1.75', // 28px line box
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
    <Section
      maxWidth={layout.proseMaxWidth}
      padding={6}
      xstyle={styles.section}>
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
