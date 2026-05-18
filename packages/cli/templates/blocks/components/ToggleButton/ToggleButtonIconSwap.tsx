// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {StarIcon as StarOutline, BookmarkIcon as BookmarkOutline, BellIcon, BellSlashIcon} from '@heroicons/react/24/outline';
import {StarIcon as StarSolid, BookmarkIcon as BookmarkSolid} from '@heroicons/react/24/solid';

export default function ToggleButtonIconSwap() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Outline → solid icon swap on press
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSToggleButton
          label="Favorite"
          icon={<XDSIcon icon={StarOutline} />}
          pressedIcon={<XDSIcon icon={StarSolid} />}
          isPressed={isFavorited}
          onPressedChange={setIsFavorited}
          isIconOnly
        />
        <XDSToggleButton
          label="Bookmark"
          icon={<XDSIcon icon={BookmarkOutline} />}
          pressedIcon={<XDSIcon icon={BookmarkSolid} />}
          isPressed={isBookmarked}
          onPressedChange={setIsBookmarked}
          isIconOnly
        />
        <XDSToggleButton
          label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          icon={<XDSIcon icon={BellIcon} />}
          pressedIcon={<XDSIcon icon={BellSlashIcon} />}
          isPressed={isMuted}
          onPressedChange={setIsMuted}
          isIconOnly
        />
      </XDSStack>
    </XDSStack>
  );
}
