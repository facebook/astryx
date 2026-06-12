// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSItem} from '@xds/core/Item';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {UserIcon, DocumentIcon, BellIcon} from '@heroicons/react/24/outline';

export default function ItemShowcase() {
  return (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSAvatar name="Alice Johnson" size={40} />}
        label="Alice Johnson"
        description="Engineering Lead"
        endContent={<XDSBadge label="Admin" />}
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={BellIcon} size="sm" />}
        label="Build completed successfully"
        description="Pipeline #4521 — all 42 tests passed"
        endContent={<XDSText color="secondary">5h ago</XDSText>}
        descriptionLines={1}
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={DocumentIcon} size="sm" />}
        label="design-spec.pdf"
        description="Modified 2 hours ago"
        endContent={<XDSText color="secondary">2.4 MB</XDSText>}
        isSelected
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={UserIcon} size="sm" />}
        label="Compact menu item"
        density="compact"
        onClick={() => {}}
      />
    </XDSStack>
  );
}
