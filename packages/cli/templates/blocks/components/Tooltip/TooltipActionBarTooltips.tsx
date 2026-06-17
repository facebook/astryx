// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Tooltip} from '@xds/core/Tooltip';
import {Button} from '@xds/core/Button';
import {HStack} from '@xds/core/Layout';
import {Center} from '@xds/core/Center';

export default function TooltipActionBarTooltips() {
  return (
    <Center>
      <HStack gap={4}>
        <Tooltip content="Save your changes" placement="above">
          <Button label="Save" />
        </Tooltip>
        <Tooltip content="Discard changes" placement="above">
          <Button label="Cancel" />
        </Tooltip>
        <Tooltip content="Delete permanently" placement="above">
          <Button label="Delete" variant="destructive" />
        </Tooltip>
      </HStack>
    </Center>
  );
}
