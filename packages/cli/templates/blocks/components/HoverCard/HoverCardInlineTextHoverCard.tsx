// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HoverCard} from '@xds/core/HoverCard';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const styles = stylex.create({
  content: {maxWidth: 200},
});

export default function HoverCardInlineTextHoverCard() {
  return (
    <Text type="body">The component uses a{' '}
      <HoverCard
        content={
          <VStack gap={1} xstyle={styles.content}>
            <Text type="label">Focus trap</Text>
            <Text type="body" color="secondary">
              A pattern that keeps keyboard focus inside a container, preventing
              it from moving to elements outside. Used in dialogs and modals to
              ensure accessibility.
            </Text>
          </VStack>
        }
        placement="above">
        focus trap
      </HoverCard>{' '}to keep keyboard navigation inside the{' '}
      <HoverCard
        content={
          <VStack gap={1} xstyle={styles.content}>
            <Text type="label">Modal dialog</Text>
            <Text type="body" color="secondary">
              An overlay that blocks interaction with the rest of the page until
              the user responds. Uses the native HTML dialog element for
              built-in accessibility and backdrop support.
            </Text>
          </VStack>
        }
        placement="above">
        modal dialog
      </HoverCard>.
          </Text>
  );
}
