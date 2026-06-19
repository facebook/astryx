// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {IconButton} from '@xds/core/IconButton';
import {Icon} from '@xds/core/Icon';

export default function IconButtonShowcase() {
  return (
    <IconButton
      label="Settings"
      icon={<Icon icon="wrench" color="inherit" />}
    />
  );
}
