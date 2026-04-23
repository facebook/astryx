'use client';

import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSButton} from '@xds/core/Button';

export default function TooltipShowcase() {
  return (
    <XDSTooltip content="This is a helpful tooltip" placement="above" isDefaultOpen>
      <XDSButton label="Hover me" />
    </XDSTooltip>
  );
}
