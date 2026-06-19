// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {HoverCard} from '@xds/core/HoverCard';
import {Avatar} from '@xds/core/Avatar';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {VStack, HStack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {CalendarIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  avatar: {flexShrink: 0},
  content: {maxWidth: 280},
});

export default function HoverCardProfileHoverCard() {
  return (
    <HoverCard
      placement="below"
      content={
        <HStack gap={3} vAlign="start" xstyle={styles.content}>
          <Avatar name="Jane Doe" size={48} xstyle={styles.avatar} />
          <VStack gap={1}>
            <Heading level={3}>@janedoe</Heading>
            <Text type="body" color="secondary">
              Crafting accessible, scalable design systems for modern teams.
            </Text>
            <HStack gap={1} vAlign="center">
              <Icon icon={CalendarIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                March 2024
              </Text>
            </HStack>
          </VStack>
        </HStack>
      }>
      <Button label="@janedoe" variant="ghost" />
    </HoverCard>
  );
}
