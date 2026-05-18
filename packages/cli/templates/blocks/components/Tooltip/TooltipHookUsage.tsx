// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSTooltip} from '@xds/core/Tooltip';
import {XDSButton} from '@xds/core/Button';
import {XDSCenter} from '@xds/core/Center';

export default function TooltipHookUsage() {
  const tooltip = useXDSTooltip({
    placement: 'above',
    delay: 100,
  });

  return (
    <XDSCenter>
      <XDSButton
        label="Using hook directly"
        ref={tooltip.ref}
        aria-describedby={tooltip.describedBy}
      />
      {tooltip.renderTooltip('Tooltip via hook')}
    </XDSCenter>
  );
}
