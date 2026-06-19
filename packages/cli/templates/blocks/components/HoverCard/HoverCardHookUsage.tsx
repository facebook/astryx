// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useHoverCard} from '@xds/core/HoverCard';
import {Button} from '@xds/core/Button';
import {Center} from '@xds/core/Center';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function HoverCardHookUsage() {
  const hoverCard = useHoverCard({
    placement: 'below',
    delay: 100,
    isDefaultOpen: true,
  });

  return (
    <Center height={220}>
      <Button
        label="Hover profile"
        ref={hoverCard.ref}
        aria-describedby={hoverCard.describedBy}
      />
      {hoverCard.renderHoverCard(
        <VStack gap={1}>
          <Text type="body" weight="bold">
            Alex Morgan
          </Text>
          <Text type="body" color="secondary">
            Staff designer · Product systems
          </Text>
          <Text type="body" color="secondary">
            Owns interaction patterns for overlays and navigation.
          </Text>
        </VStack>,
        {placement: 'below', alignment: 'center'},
      )}
    </Center>
  );
}
