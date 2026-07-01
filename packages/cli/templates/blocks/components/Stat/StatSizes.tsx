// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Stat} from '@astryxdesign/core/Stat';
import {HStack} from '@astryxdesign/core/Layout';

export default function StatSizes() {
  return (
    <HStack gap={8} vAlign="end">
      <Stat
        label="Deploys"
        value="128"
        size="sm"
        delta={{value: '+6', direction: 'up'}}
      />
      <Stat
        label="Deploys"
        value="128"
        size="md"
        delta={{value: '+6', direction: 'up'}}
      />
      <Stat
        label="Deploys"
        value="128"
        size="lg"
        delta={{value: '+6', direction: 'up'}}
      />
    </HStack>
  );
}
