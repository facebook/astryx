// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSStreamingText} from '@xds/core/hooks';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const response =
  'XDS hooks keep behavior reusable while components keep visuals consistent.';

export default function UseXDSStreamingTextHookUsage() {
  const displayedText = useXDSStreamingText(response, false, {
    speed: 'fast',
  });

  return (
    <XDSCard width={420} padding={4}>
      <XDSVStack gap={2}>
        <XDSText type="body" weight="bold">
          Assistant response
        </XDSText>
        <XDSText type="body">{displayedText}</XDSText>
        <XDSText type="supporting" color="secondary">
          Complete
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}
