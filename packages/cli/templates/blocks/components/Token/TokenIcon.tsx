// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  StarIcon,
  TagIcon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function TokenIcon() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Icons identify the token category
      </XDSText>
      <XDSStack direction="horizontal" gap={2} wrap="wrap">
        <XDSToken
          label="Sarah Chen"
          color="blue"
          icon={<XDSIcon icon={UserIcon} size="sm" color="inherit" />}
        />
        <XDSToken
          label="Featured"
          color="yellow"
          icon={<XDSIcon icon={StarIcon} size="sm" color="inherit" />}
        />
        <XDSToken
          label="Design"
          color="purple"
          icon={<XDSIcon icon={TagIcon} size="sm" color="inherit" />}
        />
        <XDSToken
          label="Verified"
          color="green"
          icon={<XDSIcon icon={ShieldCheckIcon} size="sm" color="inherit" />}
        />
      </XDSStack>
    </XDSStack>
  );
}
