// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Tooltip} from '@astryxdesign/core/Tooltip';
import {Button} from '@astryxdesign/core/Button';

export default function TooltipShowcase() {
  return (
    <Tooltip content="This is a helpful tooltip" placement="above">
      <Button label="Hover me" />
    </Tooltip>
  );
}
