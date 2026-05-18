// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSText} from '@xds/core/Text';

export default function TooltipInlineTextTooltips() {
  return (
    <XDSText type="body">
      Learn more about our{' '}
      <XDSTooltip
        content="Your data is encrypted and never shared"
        placement="above">
        privacy policy
      </XDSTooltip>{' '}
      and{' '}
      <XDSTooltip content="Standard 30-day agreement" placement="above">
        terms of service
      </XDSTooltip>
      .
    </XDSText>
  );
}
