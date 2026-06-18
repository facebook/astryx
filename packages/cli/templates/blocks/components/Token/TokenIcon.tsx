// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Token} from '@xds/core/Token';
import {Icon} from '@xds/core/Icon';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {
  StarIcon,
  TagIcon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function TokenIcon() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Icons identify the token category
      </Text>
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Token
          label="Sarah Chen"
          color="blue"
          icon={<Icon icon={UserIcon} size="sm" color="inherit" />}
        />
        <Token
          label="Featured"
          color="yellow"
          icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
        />
        <Token
          label="Design"
          color="purple"
          icon={<Icon icon={TagIcon} size="sm" color="inherit" />}
        />
        <Token
          label="Verified"
          color="green"
          icon={<Icon icon={ShieldCheckIcon} size="sm" color="inherit" />}
        />
      </Stack>
    </Stack>
  );
}
