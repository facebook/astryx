'use client';

import {XDSTooltip} from '@xds/core/Tooltip';

export default function TooltipInlineTextTooltips() {
  return (
    <p>
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
    </p>
  );
}
