// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {TagIcon} from '@heroicons/react/24/outline';

export default function TokenShowcase() {
  return (
    <XDSStack direction="horizontal" gap={2} vAlign="center">
      <XDSToken label="Default" />
      <XDSToken label="Removable" color="blue" onRemove={() => {}} />
      <XDSToken
        label="Design"
        color="purple"
        icon={<XDSIcon icon={TagIcon} size="sm" color="inherit" />}
      />
    </XDSStack>
  );
}
