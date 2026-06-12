// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function HoverCardHookUsage() {
  const hoverCard = useXDSHoverCard({
    placement: 'below',
    delay: 100,
    isDefaultOpen: true,
  });

  return (
    <XDSCenter height={220}>
      <XDSButton
        label="Hover profile"
        ref={hoverCard.ref}
        aria-describedby={hoverCard.describedBy}
      />
      {hoverCard.renderHoverCard(
        <XDSVStack gap={1}>
          <XDSText type="body" weight="bold">
            Alex Morgan
          </XDSText>
          <XDSText type="body" color="secondary">
            Staff designer · Product systems
          </XDSText>
          <XDSText type="body" color="secondary">
            Owns interaction patterns for overlays and navigation.
          </XDSText>
        </XDSVStack>,
        {placement: 'below', alignment: 'center'},
      )}
    </XDSCenter>
  );
}
