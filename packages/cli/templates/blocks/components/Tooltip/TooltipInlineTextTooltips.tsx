// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Tooltip} from '@astryxdesign/core/Tooltip';
import {Text} from '@astryxdesign/core/Text';

export default function TooltipInlineTextTooltips() {
  return (
    <Text type="body">Learn more about our{' '}
      <Tooltip
        content="Your data is encrypted and never shared"
        placement="above">
        privacy policy
      </Tooltip>{' '}and{' '}
      <Tooltip content="Standard 30-day agreement" placement="above">
        terms of service
      </Tooltip>.
          </Text>
  );
}
