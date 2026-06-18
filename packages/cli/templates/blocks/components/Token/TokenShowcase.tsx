// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Token} from '@xds/core/Token';
import {Icon} from '@xds/core/Icon';
import {Stack} from '@xds/core/Layout';
import {TagIcon} from '@heroicons/react/24/outline';

export default function TokenShowcase() {
  return (
    <Stack direction="horizontal" gap={2} vAlign="center">
      <Token label="Default" />
      <Token label="Removable" color="blue" onRemove={() => {}} />
      <Token
        label="Design"
        color="purple"
        icon={<Icon icon={TagIcon} size="sm" color="inherit" />}
      />
    </Stack>
  );
}
