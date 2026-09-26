// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HStack} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';

export default function HStackBasic() {
  return (
    <HStack gap={2} vAlign="center">
      <Badge label="React" />
      <Badge label="TypeScript" />
      <Badge label="Node.js" />
    </HStack>
  );
}
