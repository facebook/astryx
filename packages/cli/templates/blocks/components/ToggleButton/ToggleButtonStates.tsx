// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {StarIcon as StarOutline} from '@heroicons/react/24/outline';
import {StarIcon as StarSolid} from '@heroicons/react/24/solid';

export default function ToggleButtonStates() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            pressedIcon={<XDSIcon icon={StarSolid} />}
            isPressed={false}
            onPressedChange={() => {}}
          />
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            pressedIcon={<XDSIcon icon={StarSolid} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Pressed
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            pressedIcon={<XDSIcon icon={StarSolid} />}
            isPressed={true}
            onPressedChange={() => {}}
          />
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            pressedIcon={<XDSIcon icon={StarSolid} />}
            isPressed={true}
            onPressedChange={() => {}}
            isIconOnly
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isDisabled
          />
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
            isDisabled
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Loading
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isLoading
          />
          <XDSToggleButton
            label="Favorite"
            icon={<XDSIcon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
            isLoading
          />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
