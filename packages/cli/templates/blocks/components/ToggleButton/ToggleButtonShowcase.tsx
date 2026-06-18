// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ToggleButton} from '@xds/core/ToggleButton';
import {Stack} from '@xds/core/Layout';
import {Icon} from '@xds/core/Icon';
import {StarIcon as StarOutline, BookmarkIcon as BookmarkOutline, BellIcon, BellSlashIcon} from '@heroicons/react/24/outline';
import {StarIcon as StarSolid, BookmarkIcon as BookmarkSolid} from '@heroicons/react/24/solid';

export default function ToggleButtonShowcase() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <Stack direction="horizontal" gap={3} vAlign="center">
      <ToggleButton
        label="Favorite"
        icon={<Icon icon={StarOutline} />}
        pressedIcon={<Icon icon={StarSolid} />}
        isPressed={isFavorited}
        onPressedChange={setIsFavorited}
        isIconOnly
      />
      <ToggleButton
        label="Bookmark"
        icon={<Icon icon={BookmarkOutline} />}
        pressedIcon={<Icon icon={BookmarkSolid} />}
        isPressed={isBookmarked}
        onPressedChange={setIsBookmarked}
        isIconOnly
      />
      <ToggleButton
        label="Notifications"
        icon={<Icon icon={BellIcon} />}
        pressedIcon={<Icon icon={BellSlashIcon} />}
        isPressed={isMuted}
        onPressedChange={setIsMuted}>
        Notifications
      </ToggleButton>
    </Stack>
  );
}
