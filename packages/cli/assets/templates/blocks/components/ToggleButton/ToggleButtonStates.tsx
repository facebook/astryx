// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {StarIcon as StarOutline} from '@astryxdesign/icons-heroicons';
import {StarSolidIcon as StarSolid} from '@astryxdesign/icons-heroicons';

export default function ToggleButtonStates() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Default
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            pressedIcon={<Icon icon={StarSolid} />}
            isPressed={false}
            onPressedChange={() => {}}
          />
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            pressedIcon={<Icon icon={StarSolid} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
          />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Pressed
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            pressedIcon={<Icon icon={StarSolid} />}
            isPressed={true}
            onPressedChange={() => {}}
          />
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            pressedIcon={<Icon icon={StarSolid} />}
            isPressed={true}
            onPressedChange={() => {}}
            isIconOnly
          />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isDisabled
          />
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
            isDisabled
          />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Loading
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isLoading
          />
          <ToggleButton
            label="Favorite"
            icon={<Icon icon={StarOutline} />}
            isPressed={false}
            onPressedChange={() => {}}
            isIconOnly
            isLoading
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
