// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HoverCard} from '@xds/core/HoverCard';
import {Icon} from '@xds/core/Icon';
import {VStack, HStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {LinkIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  content: {maxWidth: 280},
});

export default function HoverCardInteractiveContent() {
  return (
    <Text type="body">Read more in the{' '}
      <HoverCard
        placement="below"
        content={
          <VStack gap={2} xstyle={styles.content}>
            <HStack gap={2} vAlign="start">
              <Icon icon={LinkIcon} size="sm" color="secondary" />
              <VStack gap={1}>
                <Text type="label">Getting Started Guide</Text>
                <Text type="body" color="secondary">
                  Learn how to set up your first project, invite team members,
                  and configure your workspace.
                </Text>
                <Text type="supporting" color="secondary">
                  docs.example.com/getting-started
                </Text>
              </VStack>
            </HStack>
          </VStack>
        }>
        Getting Started Guide
      </HoverCard>.
          </Text>
  );
}
